import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import get_settings

settings = get_settings()


async def send_email_notification(subject: str, html_content: str):
    """Send email notification to admin."""
    if not settings.SMTP_USER or settings.SMTP_USER == "your_gmail@gmail.com":
        print(f"📧 Email not configured. Would have sent: {subject}")
        print(f"To: {settings.ADMIN_EMAIL}")
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_USER
        msg['To'] = settings.ADMIN_EMAIL

        msg.attach(MIMEText(html_content, 'html'))

        import asyncio
        # Run blocking SMTP code in thread pool to not block event loop
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: _send_smtp(msg))

        print(f"Email sent to {settings.ADMIN_EMAIL}: {subject}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def _send_smtp(msg):
    """Blocking SMTP send function."""
    server = smtplib.SMTP(settings.SMTP_HOST, int(settings.SMTP_PORT), timeout=10)
    server.starttls()
    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    server.send_message(msg)
    server.quit()


async def send_new_order_email(order_data: dict, user_email: str):
    """Send new order notification email to admin."""
    order_id = order_data.get('id', 'N/A')
    total = order_data.get('total_amount', 0)
    payment = order_data.get('payment_method', 'N/A')
    shipping = order_data.get('shipping_address', 'N/A')
    items = order_data.get('items', [])

    # Print to console (visible in backend terminal)
    print("\n" + "="*60)
    print(f"NEW ORDER #{order_id} - ${total:.2f}")
    print(f"Customer: {user_email}")
    print(f"Payment: {payment}")
    print(f"Items: {len(items)}")
    for item in items:
        pname = item.get('product', {}).get('name', 'Product') if item.get('product') else 'Product'
        print(f"   - {pname} x{item.get('quantity', 1)} @ ${item.get('price', 0):.2f}")
    print(f"Address: {shipping}")
    print("="*60 + "\n")

    # Also try to send email
    items_html = ""
    for item in items:
        product_name = item.get('product', {}).get('name', 'Product') if item.get('product') else 'Product'
        qty = item.get('quantity', 1)
        price = item.get('price', 0)
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{product_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${price:.2f}</td>
        </tr>
        """

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #111; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🛍️ New Order Received!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Order #{order_id}</h2>
            <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr style="background: #111; color: white;">
                    <th style="padding: 10px; text-align: left;">Product</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
                {items_html}
            </table>
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
                <p><strong>Customer Email:</strong> {user_email}</p>
                <p><strong>Payment Method:</strong> {payment}</p>
                <p><strong>Shipping Address:</strong> {shipping}</p>
                <p style="font-size: 24px; color: #111; font-weight: bold;">Total: ${total:.2f}</p>
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <a href="http://localhost:3000/admin" style="background: #111; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Order in Admin Panel</a>
            </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>This is an automated notification from Furniro E-Commerce</p>
        </div>
    </div>
    """

    await send_email_notification(f"New Order #{order_id} - ${total:.2f}", html_content)
