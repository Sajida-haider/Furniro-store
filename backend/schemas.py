from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


# ============ USER SCHEMAS ============

class UserRoleEnum(str, Enum):
    user = "user"
    admin = "admin"


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: UserRoleEnum
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============ PRODUCT SCHEMAS ============

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    original_price: Optional[float] = None
    image: str
    rating: float = Field(default=0.0, ge=0, le=5)
    reviews: int = Field(default=0, ge=0)
    category: Optional[str] = None
    category_id: Optional[int] = None
    badge: Optional[str] = None
    stock: int = Field(default=0, ge=0)
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    category: Optional[str] = None
    category_id: Optional[int] = None
    badge: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    original_price: Optional[float]
    image: str
    rating: float
    reviews: int
    category: Optional[str]
    category_id: Optional[int]
    badge: Optional[str]
    stock: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============ CATEGORY SCHEMAS ============

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    image: Optional[str] = None
    count: int = Field(default=0, ge=0)


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    count: Optional[int] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    image: Optional[str]
    count: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============ CART SCHEMAS ============

class CartItemAdd(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(default=1, gt=0)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    subtotal: float
    shipping: float
    tax: float
    total: float
    item_count: int


# ============ ORDER SCHEMAS ============

class OrderStatusEnum(str, Enum):
    pending = "pending"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class OrderCreate(BaseModel):
    shipping_address: str = Field(..., min_length=10)
    payment_method: str = Field(..., min_length=2)
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: OrderStatusEnum
    total_amount: float
    shipping_address: str
    payment_method: str
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int


# ============ ADMIN SCHEMAS ============

class AdminStats(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    recent_orders: List[OrderResponse]


class OrderStatusUpdate(BaseModel):
    status: OrderStatusEnum
