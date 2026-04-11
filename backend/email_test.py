import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import get_settings

settings = get_settings()
print('SMTP_USER:', settings.SMTP_USER)
print('SMTP_PASSWORD:', settings.SMTP_PASSWORD[:4] + '***' if settings.SMTP_PASSWORD else 'EMPTY')
print('ADMIN_EMAIL:', settings.ADMIN_EMAIL)
print()

try:
    msg = MIMEMultipart()
    msg['Subject'] = 'Furniro Test Email'
    msg['From'] = settings.SMTP_USER
    msg['To'] = settings.ADMIN_EMAIL
    msg.attach(MIMEText('<h1>Test</h1><p>Email working!</p>', 'html'))
    
    print(f"Connecting to {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
    server = smtplib.SMTP(settings.SMTP_HOST, int(settings.SMTP_PORT), timeout=10)
    server.starttls()
    print("Logged in successfully")
    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    print("Sending email...")
    server.send_message(msg)
    server.quit()
    print('SUCCESS: Email sent!')
except Exception as e:
    print(f'ERROR: {e}')
