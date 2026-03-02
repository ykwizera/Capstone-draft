import secrets
from datetime import timedelta
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.utils import timezone


def generate_otp(length: int = 6) -> str:
    return "".join(secrets.choice("0123456789") for _ in range(length))


def hash_otp(code: str) -> str:
    return make_password(code)


def verify_otp(code: str, code_hash: str) -> bool:
    return check_password(code, code_hash)


def otp_expiry(minutes: int = 10):
    return timezone.now() + timedelta(minutes=minutes)


def send_otp_email(to_email: str, code: str):
    send_mail(
        subject="IngufuPay Password Reset Code",
        message=f"Your password reset code is: {code}\nThis code expires in 10 minutes.",
        from_email=None,
        recipient_list=[to_email],
        fail_silently=False,
    )