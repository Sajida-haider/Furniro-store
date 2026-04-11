from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from database import get_db
from models import Order, OrderItem, CartItem, Product, User, UserRole, OrderStatus
from schemas import (
    OrderCreate, OrderResponse, OrderListResponse, OrderStatusEnum, CartResponse
)
from auth_utils import get_current_active_user, get_current_admin_user
from routers.cart import calculate_cart_total
from email_utils import send_new_order_email

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new order from the current cart."""
    # Get cart total
    cart = await calculate_cart_total(db, current_user.id)

    if not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty. Add items before creating an order."
        )

    # Create order
    new_order = Order(
        user_id=current_user.id,
        status=OrderStatus.PENDING,
        total_amount=cart.total,
        shipping_address=order_data.shipping_address,
        payment_method=order_data.payment_method,
        notes=order_data.notes,
    )
    db.add(new_order)
    await db.flush()
    await db.refresh(new_order)

    # Create order items from cart
    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price if cart_item.product else 0.0,
        )
        db.add(order_item)

    # Clear the cart
    cart_items_result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    cart_items = cart_items_result.scalars().all()
    for item in cart_items:
        await db.delete(item)

    await db.flush()

    # Fetch the complete order with items
    result = await db.execute(
        select(Order)
        .where(Order.id == new_order.id)
    )
    order = result.scalar_one()

    # Build response with items
    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
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

    response_data = {
        "id": order.id,
        "user_id": order.user_id,
        "status": order.status.value if hasattr(order.status, 'value') else str(order.status),
        "total_amount": order.total_amount,
        "shipping_address": order.shipping_address,
        "payment_method": order.payment_method,
        "notes": order.notes,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": items_response,
        "email_sent": False,
    }

    # Send email notification to admin
    email_error = None
    try:
        # Build plain dict for email
        email_data = {
            "id": order.id,
            "total_amount": order.total_amount,
            "payment_method": order.payment_method,
            "shipping_address": order.shipping_address,
            "items": [
                {
                    "product": {"name": p.name, "price": p.price} if p else None,
                    "quantity": oi.quantity,
                    "price": oi.price,
                }
                for oi, p in [(oi, None) for oi in order_items]
            ],
        }
        # Get product names for items
        email_items = []
        for oi in order_items:
            prod_result = await db.execute(select(Product).where(Product.id == oi.product_id))
            prod = prod_result.scalar_one_or_none()
            email_items.append({
                "product": {"name": prod.name if prod else "Unknown", "price": prod.price if prod else 0} if prod else None,
                "quantity": oi.quantity,
                "price": oi.price,
            })
        email_data["items"] = email_items

        await send_new_order_email(email_data, current_user.email)
        response_data["email_sent"] = True
    except Exception as e:
        email_error = str(e)
        response_data["email_sent"] = False
        response_data["email_error"] = email_error
        print(f"Email notification failed: {e}")
        import traceback
        traceback.print_exc()

    return response_data


@router.get("/", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List orders for the current user."""
    from sqlalchemy import func as sql_func

    # Get total count
    count_result = await db.execute(
        select(sql_func.count()).select_from(Order).where(Order.user_id == current_user.id)
    )
    total = count_result.scalar()

    # Get orders
    result = await db.execute(
        select(Order)
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    orders = result.scalars().all()

    # Build responses
    orders_response = []
    for order in orders:
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
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

        orders_response.append({
            "id": order.id,
            "user_id": order.user_id,
            "status": order.status.value if hasattr(order.status, 'value') else str(order.status),
            "total_amount": order.total_amount,
            "shipping_address": order.shipping_address,
            "payment_method": order.payment_method,
            "notes": order.notes,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "items": items_response,
        })

    return OrderListResponse(orders=orders_response, total=total)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific order by ID."""
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Get order items
    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
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
        "id": order.id,
        "user_id": order.user_id,
        "status": order.status.value if hasattr(order.status, 'value') else str(order.status),
        "total_amount": order.total_amount,
        "shipping_address": order.shipping_address,
        "payment_method": order.payment_method,
        "notes": order.notes,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": items_response,
    }


@router.post("/{order_id}/cancel", response_model=dict)
async def cancel_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Cancel an order (User can only cancel their own orders)."""
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.user_id == current_user.id
        )
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only allow cancellation if order is pending or processing
    if order.status not in [OrderStatus.PENDING, OrderStatus.PROCESSING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order with status: {order.status.value if hasattr(order.status, 'value') else str(order.status)}. Only pending or processing orders can be cancelled."
        )

    order.status = OrderStatus.CANCELLED
    await db.flush()
    await db.refresh(order)

    return {
        "id": order.id,
        "status": order.status.value if hasattr(order.status, 'value') else str(order.status),
        "message": "Order has been cancelled successfully",
    }
