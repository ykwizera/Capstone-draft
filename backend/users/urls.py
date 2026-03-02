from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from .views import (
    RegisterView,
    MeView,                          # ✅ added
    RequestPasswordResetOTPView,
    ConfirmPasswordResetView,
)

app_name = "users"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),          # ✅ added
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("password-reset/request-otp/", RequestPasswordResetOTPView.as_view(), name="request-reset-otp"),
    path("password-reset/confirm/", ConfirmPasswordResetView.as_view(), name="confirm-reset"),
]