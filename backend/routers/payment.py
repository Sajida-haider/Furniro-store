import stripe
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Order, OrderItem, CartItem, Product
from schemas import OrderCreate, OrderResponse
from auth_utils import get_current_active_user
from config import get_settings
from routers.cart import calculate_cart_total

settings = get_settings()

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/payment", tags=["Payment - Stripe"])


@router.post("/create-intent")
async def create_payment_intent(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a Stripe PaymentIntent for the current cart total."""
    cart = await calculate_cart_total(db, current_user.id)

    if not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )

    # Stripe uses cents, so multiply by 100
    amount_cents = int(round(cart.total * 100))

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            metadata={
                "user_id": str(current_user.id),
                "cart_total": str(cart.total),
            },
        )
        return {
            "client_secret": intent.client_secret,
            "amount": amount_cents,
            "currency": "usd",
            "cart_total": cart.total,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stripe error: {str(e)}"
        )


@router.post("/confirm-order")
async def confirm_order_after_payment(
    order_data: OrderCreate,
    payment_intent_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create order after successful Stripe payment."""
    # Verify payment intent
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        if intent.status != "succeeded":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment not completed. Status: " + intent.status
            )
    except stripe.error.StripeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment intent"
        )

    # Get cart
    cart = await calculate_cart_total(db, current_user.id)
    if not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )

    # Create order
    from models import OrderStatus
    new_order = Order(
        user_id=current_user.id,
        status=OrderStatus.PENDING,
        total_amount=cart.total,
        shipping_address=order_data.shipping_address,
        payment_method="stripe",
        notes=order_data.notes,
    )
    db.add(new_order)
    await db.flush()
    await db.refresh(new_order)

    # Create order items
    for cart_item in cart.items:
        product_result = await db.execute(
            select(Product).where(Product.id == cart_item.product_id)
        )
        product = product_result.scalar_one_or_none()
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=product.price if product else 0.0,
        )
        db.add(order_item)

    # Clear cart
    cart_items_result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    cart_items = cart_items_result.scalars().all()
    for item in cart_items:
        await db.delete(item)

    await db.flush()

    # Build response
    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == new_order.id)
    )
    order_items = items_result.scalars().all()

    from schemas import OrderItemResponse, ProductResponse
    items_response = []
    for oi in order_items:
        product_result = await db.execute(select(Product).where(Product.id == oi.product_id))
        product = product_result.scalar_one_or_none()
        items_response.append(OrderItemResponse(
            id=oi.id,
            product_id=oi.product_id,
            quantity=oi.quantity,
            price=oi.price,
            product=ProductResponse.model_validate(product) if product else None,
        ))

    return {
        "id": new_order.id,
        "user_id": new_order.user_id,
        "status": new_order.status.value if hasattr(new_order.status, 'value') else str(new_order.status),
        "total_amount": new_order.total_amount,
        "shipping_address": new_order.shipping_address,
        "payment_method": new_order.payment_method,
        "notes": new_order.notes,
        "created_at": new_order.created_at,
        "updated_at": new_order.updated_at,
        "items": items_response,
        "stripe_payment_intent": payment_intent_id,
    }


@router.get("/config")
async def get_stripe_config():
    """Get Stripe publishable key for frontend."""
    if not settings.STRIPE_PUBLISHABLE_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe not configured. Add STRIPE_PUBLISHABLE_KEY to .env"
        )
    return {
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
        "currency": "usd",
    }
