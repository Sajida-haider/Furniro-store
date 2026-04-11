# Furniro E-Commerce Backend (FastAPI)

## Prerequisites

- Python 3.10+
- PostgreSQL (optional - SQLite is used by default for development)

## Quick Start

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and adjust settings:

```bash
cp .env.example .env
```

The default `.env` uses SQLite (no PostgreSQL required for development):

```env
DATABASE_URL=sqlite+aiosqlite:///./furniro.db
SECRET_KEY=furniro-super-secret-key-2024-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:3000
APP_ENV=development
```

### 4. Run the Server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at: **http://localhost:8000**

- **API Docs (Swagger):** http://localhost:8000/docs
- **Alternative Docs (ReDoc):** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

## Default Admin Account

After first run, the database is auto-seeded with:

- **Email:** admin@furniro.com
- **Username:** admin
- **Password:** admin123
- **Role:** Admin

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login & get JWT token | No |
| POST | `/api/auth/logout` | Logout (discard token) | Yes |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products/` | List products (paginated) | No |
| GET | `/api/products/{id}` | Get product detail | No |
| POST | `/api/products/` | Create product | Admin |
| PUT | `/api/products/{id}` | Update product | Admin |
| DELETE | `/api/products/{id}` | Delete product | Admin |

**Query Params for LIST:** `page`, `page_size`, `category`, `search`, `sort` (price_asc, price_desc, rating, newest)

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories/` | List all categories | No |
| GET | `/api/categories/{id}` | Get category detail | No |
| POST | `/api/categories/` | Create category | Admin |
| PUT | `/api/categories/{id}` | Update category | Admin |
| DELETE | `/api/categories/{id}` | Delete category | Admin |

### Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart/` | Get user's cart | Yes |
| POST | `/api/cart/items` | Add item to cart | Yes |
| PUT | `/api/cart/items/{id}` | Update cart item quantity | Yes |
| DELETE | `/api/cart/items/{id}` | Remove item from cart | Yes |
| DELETE | `/api/cart/clear` | Clear entire cart | Yes |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders/` | Create order from cart | Yes |
| GET | `/api/orders/` | List user's orders | Yes |
| GET | `/api/orders/{id}` | Get order detail | Yes |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/users` | List all users | Admin |
| PUT | `/api/admin/users/{id}/role` | Update user role | Admin |
| PUT | `/api/admin/users/{id}/active` | Toggle user active status | Admin |
| GET | `/api/admin/products` | List all products (incl. inactive) | Admin |
| GET | `/api/admin/categories` | List all categories | Admin |
| GET | `/api/admin/orders` | List all orders | Admin |
| PUT | `/api/admin/orders/{id}/status` | Update order status | Admin |

## Using PostgreSQL

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE furniro_db;
```

2. Update `.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/furniro_db
```

3. Install asyncpg:
```bash
pip install asyncpg
```

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── config.py            # Settings & environment variables
├── database.py          # Database engine & session
├── models.py            # SQLAlchemy ORM models
├── schemas.py           # Pydantic validation schemas
├── auth_utils.py        # JWT & password utilities
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables
├── .env.example         # Environment template
└── routers/
    ├── __init__.py
    ├── auth.py          # Authentication routes
    ├── products.py      # Product CRUD routes
    ├── categories.py    # Category CRUD routes
    ├── cart.py          # Shopping cart routes
    ├── orders.py        # Order routes
    └── admin.py         # Admin panel routes
```

## Authentication Flow

1. **Signup/Login** → Receive JWT token in response
2. **Store token** on the frontend (localStorage/cookies)
3. **Include token** in all subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```
4. **Logout** → Discard token on the frontend

## Error Handling

All endpoints return standard HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error
