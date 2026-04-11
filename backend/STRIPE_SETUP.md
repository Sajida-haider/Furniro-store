# 🔥 Stripe Payment Setup Guide

## 1. Get Stripe Test Keys (FREE)

1. Go to **https://dashboard.stripe.com/register**
2. Create free account (email + password)
3. Make sure you're in **Test Mode** (toggle top-right corner)
4. Go to **Developers → API keys** → https://dashboard.stripe.com/test/apikeys
5. Copy two keys:
   - **Publishable key** — starts with `pk_test_`
   - **Secret key** — starts with `sk_test_`

## 2. Add Keys to Backend

Open `backend/.env` and replace:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
```

## 3. Restart Backend

```bash
cd backend
# Kill existing process first
taskkill /F /IM python.exe
# Restart
python -m uvicorn main:app --reload --port 8000
```

## 4. Test Payment

1. Login to Furniro frontend
2. Add products to cart
3. Go to **Checkout**
4. Fill shipping details
5. Click **"Pay with Stripe"** button
6. Payment will be processed via Stripe test mode
7. Order will be created and you'll be redirected to `/orders`

## Test Card Details (FREE, no real charges)

| Field | Value |
|-------|-------|
| Card Number | `4242 4242 4242 4242` |
| Expiry | `12/30` |
| CVC | `123` |
| Name | Any name |

## Other Test Cards

- `4000 0000 0000 9995` — Declined card (tests failure)
- `4000 0025 0000 3155` — Requires 3D Secure authentication

## What Happens?

1. **Frontend** creates PaymentIntent via backend
2. **Stripe** processes payment (test mode — NO real money)
3. **Backend** confirms payment succeeded
4. **Order** is created in database
5. **Cart** is cleared
6. User redirected to **My Orders** page

## Live Mode (Production)

When ready for production:
1. Switch Stripe dashboard to **Live Mode**
2. Get live API keys
3. Replace test keys in `.env`
4. Deploy backend to production server
