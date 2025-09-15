# junk/emails.py
from django.core.mail import EmailMessage, send_mail
from django.conf import settings
from django.utils.html import escape
import mimetypes

def _attach_image_if_any(email_msg, obj):
    if getattr(obj, "image", None) and obj.image.name:
        # Ensure file is open and attach
        obj.image.open("rb")
        try:
            filename = obj.image.name.rsplit("/", 1)[-1]
            mime, _ = mimetypes.guess_type(filename)
            email_msg.attach(filename, obj.image.read(), mime or "application/octet-stream")
        finally:
            obj.image.close()

def send_quote_notification_to_owner(qr):
    """
    Email the site owner a detailed notification about a new quote.
    Attaches the uploaded image if present.
    """
    subject = f"New Quote Request • {qr.get_service_type_display()} • {qr.first_name} {qr.last_name}"
    to_email = getattr(settings, "QUOTE_NOTIFY_TO", settings.DEFAULT_FROM_EMAIL)

    lines = [
        "You have a new quote request:",
        "",
        f"Name: {qr.first_name} {qr.last_name}",
        f"Email: {qr.email}",
        f"Phone: {qr.phone or '-'}",
        f"Service address: {qr.service_address}",
        f"Service type: {qr.get_service_type_display()}",
        "",
        "Description:",
        qr.description,
        "",
        f"Submitted at: {qr.created_at:%Y-%m-%d %H:%M}",
    ]
    body = "\n".join(lines)

    msg = EmailMessage(subject=subject, body=body, from_email=settings.DEFAULT_FROM_EMAIL, to=[to_email])
    _attach_image_if_any(msg, qr)
    msg.send(fail_silently=False)

def send_quote_autoreply_to_customer(qr):
    """
    Optional courtesy auto-reply to the requester.
    """
    subject = "Thanks for your quote request"
    body = (
        f"Hi {qr.first_name},\n\n"
        "Thanks for reaching out to AI All Junk Removal! We received your request and will contact you shortly.\n\n"
        "Summary:\n"
        f"- Service: {qr.get_service_type_display()}\n"
        f"- Address: {qr.service_address}\n\n"
        "If you have photos or more details, just reply to this email.\n\n"
        "Best,\nAI All Junk Removal Team"
    )
    send_mail(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        [qr.email],
        fail_silently=True,  # don't block the main flow if customer email has issues
    )
