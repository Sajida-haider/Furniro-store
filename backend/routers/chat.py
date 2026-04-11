from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import os

from database import get_db
from models import Product
from config import get_settings

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

settings = get_settings()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


# OpenAI API Key
OPENAI_API_KEY = settings.OPENAI_API_KEY

try:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
    OPENAI_AVAILABLE = bool(OPENAI_API_KEY and client)
except Exception:
    client = None
    OPENAI_AVAILABLE = False


def get_products_context(products: list) -> str:
    """Format products as context for the AI."""
    if not products:
        return "No products currently available."
    
    context = "Furniro Product Catalog:\n\n"
    for p in products[:15]:
        context += f"- {p.name}: ${p.price:.2f}"
        if p.original_price:
            context += f" (was ${p.original_price:.2f})"
        context += f"\n  Category: {p.category or 'N/A'}"
        if p.description:
            context += f"\n  Description: {p.description[:100]}"
        context += f"\n  Stock: {p.stock} available"
        if p.badge:
            context += f" [{p.badge}]"
        context += "\n\n"
    return context


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """AI Chatbot endpoint using OpenAI with product context."""
    # Fetch products for context
    result = await db.execute(select(Product).where(Product.is_active == True).limit(15))
    products = result.scalars().all()
    
    products_context = get_products_context(products)
    
    system_prompt = f"""You are a helpful and friendly AI shopping assistant for Furniro, a premium modern furniture ecommerce store.

Current Product Catalog:
{products_context}

Store Policies:
- FREE shipping on orders over $500. Standard shipping is $49.99.
- 30-day return policy with full refund.
- 2-year warranty on all products.
- Payment methods: Cash on Delivery, JazzCash, EasyPaisa.
- Delivery takes 5-7 business days.

Be helpful, concise, and friendly. Always recommend products from the catalog when relevant. Include prices and key details. If a product isn't in the catalog, suggest browsing the full collection at the store."""

    if OPENAI_AVAILABLE and client:
        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message},
                ],
                max_tokens=500,
                temperature=0.7,
            )
            reply = response.choices[0].message.content.strip()
            return ChatResponse(reply=reply)
        except Exception as e:
            print(f"OpenAI error: {e}")
    
    # Fallback: rule-based response
    msg = request.message.lower().strip()
    
    if any(w in msg for w in ['hello', 'hi', 'hey']):
        return ChatResponse(reply="Hello! Welcome to Furniro. I'd be happy to help you find the perfect furniture. What are you looking for?")
    
    if any(w in msg for w in ['product', 'show', 'have', 'find']):
        reply = "Here are some products we have:\n\n"
        for i, p in enumerate(products[:5], 1):
            reply += f"{i}. **{p.name}** - ${p.price:.2f}"
            if p.original_price:
                reply += f" ~~${p.original_price:.2f}~~"
            reply += f"\n   {p.category or ''}\n\n"
        reply += "Would you like more details about any product?"
        return ChatResponse(reply=reply)
    
    if any(w in msg for w in ['shipping', 'delivery']):
        return ChatResponse(reply="We offer FREE shipping on orders over $500! Standard shipping is $49.99. Delivery typically takes 5-7 business days.")
    
    if any(w in msg for w in ['return', 'refund']):
        return ChatResponse(reply="We offer a 30-day return policy. If you're not satisfied, you can return within 30 days for a full refund.")
    
    if any(w in msg for w in ['payment', 'pay', 'jazzcash', 'easypaisa']):
        return ChatResponse(reply="We accept Cash on Delivery, JazzCash, and EasyPaisa. All payments are secure and hassle-free.")
    
    if any(w in msg for w in ['thank', 'thanks']):
        return ChatResponse(reply="You're welcome! Feel free to ask if you need more help. Happy shopping!")
    
    return ChatResponse(reply="I'd love to help! I can show you products, answer questions about pricing, shipping, returns, and more. What would you like to know?")
