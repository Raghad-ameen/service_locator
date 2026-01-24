# users/utils.py
from django.core.mail import send_mail
from django.conf import settings

def send_verification_email(user):
    verification_link = f"http://localhost:5173/verify-email/{user.email_verification_token}"

    send_mail(
        subject="Verify your email",
        message=f"Click this link to verify your account:\n{verification_link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
