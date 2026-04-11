from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import CartItem, Product, User
from schemas import CartItemAdd, CartItemUpdate, CartItemResponse, CartResponse
from auth_utils import get_current_active_user

router = APIRouter(prefix="/cart", tags=["Cart"])


TAX_RATE = 0.08
FREE_SHIPPING_THRESHOLD = 500.0
SHIPPING_COST = 49.99


async def calculate_cart_total(db: AsyncSession, user_id: int) -> CartResponse:
    """Calculate the full cart with totals for a user."""
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .join(Product, CartItem.product_id == Product.id)
        .where(Product.is_active == True)
    )
    cart_items = result.scalars().all()

    items_response = []
    subtotal = 0.0

    for item in cart_items:
        product_result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = product_result.scalar_one_or_none()
        if product:
            subtotal += product.price * item.quantity
            items_response.append(CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                product=CartItemResponse.__pydantic_complete__ and None,
            ))

    # Rebuild with full product data
    items_response = []
    for item in cart_items:
        product_result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = product_result.scalar_one_or_none()
        if product:
            from schemas import ProductResponse
            items_response.append(CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                product=ProductResponse.model_validate(product),
            ))

    shipping = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_COST
    tax = subtotal * TAX_RATE
    total = subtotal + shipping + tax

    return CartResponse(
        items=items_response,
        subtotal=subtotal,
        shipping=shipping,
        tax=tax,
        total=total,
        item_count=len(items_response),
    )


@router.get("/", response_model=CartResponse)
async def get_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get current user's cart."""
    return await calculate_cart_total(db, current_user.id)


@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item_data: CartItemAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Add a product to the cart."""
    # Verify product exists
    product_result = await db.execute(select(Product).where(Product.id == item_data.product_id))
    product = product_result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available"
        )

    # Check if item already in cart
    existing_result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == item_data.product_id
        )
    )
    existing_item = existing_result.scalar_one_or_none()

    if existing_item:
        existing_item.quantity += item_data.quantity
        await db.flush()
        await db.refresh(existing_item)
        cart_item = existing_item
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
        )
        db.add(cart_item)
        await db.flush()
        await db.refresh(cart_item)

    # Return with product data
    from schemas import ProductResponse
    return CartItemResponse(
        id=cart_item.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
        product=ProductResponse.model_validate(product),
    )


@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: int,
    update_data: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update quantity of a cart item."""
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id
        )
    )
    cart_item = result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    cart_item.quantity = update_data.quantity
    await db.flush()
    await db.refresh(cart_item)

    # Get product data
    product_result = await db.execute(select(Product).where(Product.id == cart_item.product_id))
    product = product_result.scalar_one_or_none()

    from schemas import ProductResponse
    return CartItemResponse(
        id=cart_item.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
        product=ProductResponse.model_validate(product) if product else None,
    )


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Remove an item from the cart."""
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id
        )
    )
    cart_item = result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    await db.delete(cart_item)
    return None


@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Clear all items from the cart."""
    result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    cart_items = result.scalars().all()

    for item in cart_items:
        await db.delete(item)

    return None
