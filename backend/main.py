from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import init_db, engine
from routers import auth, products, categories, cart, orders, admin, payment, chat

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    await init_db()
    await seed_initial_data()
    yield
    # Shutdown: Close connections
    await engine.dispose()


async def seed_initial_data():
    """Seed initial categories and products if database is empty."""
    from sqlalchemy import select
    from sqlalchemy.ext.asyncio import AsyncSession
    from database import async_session
    from models import Category, Product

    async with async_session() as session:
        # Check if data already exists
        result = await session.execute(select(Category))
        if result.scalars().first():
            return  # Already seeded

        # Seed categories
        categories_data = [
            {"name": "Dining", "image": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop", "count": 156},
            {"name": "Living", "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop", "count": 124},
            {"name": "Bedroom", "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop", "count": 89},
        ]

        categories = []
        for cat_data in categories_data:
            cat = Category(**cat_data)
            session.add(cat)
            categories.append(cat)

        await session.flush()

        # Seed products
        products_data = [
            {
                "name": "Syltherine",
                "description": "Stylish cafe chair with comfortable cushion and modern design.",
                "price": 299.99,
                "original_price": 399.99,
                "image": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop",
                "rating": 4.8,
                "reviews": 124,
                "category": "Stylish cafe chair",
                "category_id": categories[0].id,
                "badge": "Sale",
                "stock": 50,
            },
            {
                "name": "Leviosa",
                "description": "Luxury sofa with premium fabric and elegant design.",
                "price": 599.99,
                "image": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&h=500&fit=crop",
                "rating": 4.9,
                "reviews": 89,
                "category": "Luxury sofa",
                "category_id": categories[1].id,
                "stock": 30,
            },
            {
                "name": "Lolito",
                "description": "Luxury big sofa with spacious seating.",
                "price": 249.99,
                "original_price": 329.99,
                "image": "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&h=500&fit=crop",
                "rating": 4.7,
                "reviews": 67,
                "category": "Luxury big sofa",
                "category_id": categories[1].id,
                "badge": "Sale",
                "stock": 40,
            },
            {
                "name": "Respira",
                "description": "Outdoor bar table and stool set.",
                "price": 899.99,
                "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&h=500&fit=crop",
                "rating": 4.9,
                "reviews": 203,
                "category": "Outdoor bar table and stool",
                "category_id": categories[2].id,
                "badge": "New",
                "stock": 20,
            },
            {
                "name": "Grifo",
                "description": "Minimalist night stand with sleek design.",
                "price": 199.99,
                "image": "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=500&h=500&fit=crop",
                "rating": 4.6,
                "reviews": 45,
                "category": "Night stand",
                "category_id": categories[2].id,
                "stock": 60,
            },
            {
                "name": "Muggo",
                "description": "Small mug with elegant ceramic finish.",
                "price": 449.99,
                "original_price": 549.99,
                "image": "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&h=500&fit=crop",
                "rating": 4.8,
                "reviews": 156,
                "category": "Small mug",
                "category_id": categories[0].id,
                "badge": "Sale",
                "stock": 100,
            },
            {
                "name": "Pingky",
                "description": "Cute bed set with comfortable mattress.",
                "price": 149.99,
                "image": "https://images.unsplash.com/photo-1503602642458-232111445657?w=500&h=500&fit=crop",
                "rating": 4.5,
                "reviews": 78,
                "category": "Cute bed set",
                "category_id": categories[2].id,
                "stock": 35,
            },
            {
                "name": "Potty",
                "description": "Minimalist flower pot with modern design.",
                "price": 129.99,
                "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop",
                "rating": 4.7,
                "reviews": 92,
                "category": "Minimalist flower pot",
                "category_id": categories[1].id,
                "badge": "New",
                "stock": 75,
            },
        ]

        for prod_data in products_data:
            session.add(Product(**prod_data))

        # Create admin user
        from models import User, UserRole
        from auth_utils import get_password_hash

        admin_user = User(
            email="admin@furniro.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
        )
        session.add(admin_user)

        await session.commit()


app = FastAPI(
    title="Furniro E-Commerce API",
    description="RESTful API for Furniro e-commerce platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(payment.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Furniro E-Commerce API",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
