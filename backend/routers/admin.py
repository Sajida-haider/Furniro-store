from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sql_func
from typing import Optional

from database import get_db
from models import (
    User, Product, Order, OrderItem, Category, UserRole, OrderStatus
)
from schemas import (
    UserResponse, ProductResponse, ProductCreate, ProductUpdate,
    CategoryResponse, CategoryCreate, CategoryUpdate,
    OrderResponse, OrderStatusUpdate, OrderStatusEnum,
    AdminStats,
)
from auth_utils import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


# ============ DASHBOARD STATS ============

@router.get("/stats", response_model=AdminStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get admin dashboard statistics."""
    # Total users
    users_count = await db.execute(select(sql_func.count()).select_from(User))
    total_users = users_count.scalar()

    # Total products
    products_count = await db.execute(select(sql_func.count()).select_from(Product))
    total_products = products_count.scalar()

    # Total orders
    orders_count = await db.execute(select(sql_func.count()).select_from(Order))
    total_orders = orders_count.scalar()

    # Total revenue
    revenue_result = await db.execute(
        select(sql_func.sum(Order.total_amount)).where(
            Order.status != OrderStatus.CANCELLED
        )
    )
    total_revenue = revenue_result.scalar() or 0.0

    # Recent orders
    recent_orders_result = await db.execute(
        select(Order)
        .order_by(Order.created_at.desc())
        .limit(10)
    )
    recent_orders = recent_orders_result.scalars().all()

    # Build recent orders response
    from schemas import OrderItemResponse, ProductResponse as PR
    recent_orders_data = []
    for order in recent_orders:
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
        )
        order_items = items_result.scalars().all()

        items_response = []
        for oi in order_items:
            product_result = await db.execute(select(Product).where(Product.id == oi.product_id))
            product = product_result.scalar_one_or_none()
            items_response.append(OrderItemResponse(
                id=oi.id,
                product_id=oi.product_id,
                quantity=oi.quantity,
                price=oi.price,
                product=PR.model_validate(product) if product else None,
            ))

        recent_orders_data.append({
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

    return AdminStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=total_revenue,
        recent_orders=recent_orders_data,
    )


# ============ USER MANAGEMENT ============

@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """List all users (Admin only)."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return users


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: UserRole,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update a user's role (Admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.put("/users/{user_id}/active")
async def toggle_user_active(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Toggle user active status (Admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)


# ============ PRODUCT MANAGEMENT (Admin) ============

@router.get("/products", response_model=list[ProductResponse])
async def admin_list_products(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """List all products including inactive (Admin only)."""
    result = await db.execute(select(Product).order_by(Product.created_at.desc()))
    products = result.scalars().all()
    return products


# ============ CATEGORY MANAGEMENT (Admin) ============

@router.get("/categories", response_model=list[CategoryResponse])
async def admin_list_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """List all categories (Admin only)."""
    result = await db.execute(select(Category).order_by(Category.name.asc()))
    categories = result.scalars().all()
    return categories


# ============ ORDER MANAGEMENT (Admin) ============

@router.get("/orders", response_model=list[dict])
async def admin_list_orders(
    status_filter: Optional[OrderStatusEnum] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """List all orders with optional status filter (Admin only)."""
    query = select(Order).order_by(Order.created_at.desc())

    if status_filter:
        query = query.where(Order.status == status_filter)

    result = await db.execute(query)
    orders = result.scalars().all()

    orders_data = []
    from schemas import OrderItemResponse, ProductResponse as PR
    for order in orders:
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
        )
        order_items = items_result.scalars().all()

        # Get user info
        user_result = await db.execute(select(User).where(User.id == order.user_id))
        user = user_result.scalar_one_or_none()

        items_response = []
        for oi in order_items:
            product_result = await db.execute(select(Product).where(Product.id == oi.product_id))
            product = product_result.scalar_one_or_none()
            items_response.append(OrderItemResponse(
                id=oi.id,
                product_id=oi.product_id,
                quantity=oi.quantity,
                price=oi.price,
                product=PR.model_validate(product) if product else None,
            ))

        orders_data.append({
            "id": order.id,
            "user_id": order.user_id,
            "user_email": user.email if user else "Unknown",
            "user_name": user.username if user else "Unknown",
            "status": order.status.value if hasattr(order.status, 'value') else str(order.status),
            "total_amount": order.total_amount,
            "shipping_address": order.shipping_address,
            "payment_method": order.payment_method,
            "notes": order.notes,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "items": items_response,
        })

    return orders_data


@router.put("/orders/{order_id}/status", response_model=dict)
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update order status (Admin only)."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_update.status
    await db.flush()
    await db.refresh(order)

    return {
        "id": order.id,
        "status": order.status.value if hasattr(order.status, 'value') else str(order.status),
        "message": f"Order status updated to {order.status.value if hasattr(order.status, 'value') else str(order.status)}",
    }


@router.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete an order (Admin only)."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Delete order items first
    items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order_id))
    order_items = items_result.scalars().all()
    for item in order_items:
        await db.delete(item)

    await db.delete(order)
    return None
