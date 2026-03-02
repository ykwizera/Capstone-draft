from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import PasswordResetOTP
from .utils import generate_otp, hash_otp, verify_otp, otp_expiry, send_otp_email

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("username", "email", "phone_number", "password", "role")
        extra_kwargs = {
            "role": {"read_only": True}
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):  # ✅ top level, not indented
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "phone_number",
            "role",
            "is_active",
            "date_joined",
            "last_login",
        )
        read_only_fields = (
            "id",
            "role",
            "is_active",
            "date_joined",
            "last_login",
        )


class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            self.context["user"] = None
            return value
        self.context["user"] = user
        return value

    def save(self):
        user = self.context.get("user")
        if not user:
            return

        code = generate_otp()
        PasswordResetOTP.objects.create(
            user=user,
            code_hash=hash_otp(code),
            expires_at=otp_expiry(10),
        )
        send_otp_email(user.email, code)


class ConfirmPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(min_length=8, max_length=128)

    def validate(self, attrs):
        try:
            user = User.objects.get(email=attrs["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or OTP.")

        otp_obj = (
            PasswordResetOTP.objects
            .filter(user=user, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if not otp_obj:
            raise serializers.ValidationError("Invalid email or OTP.")

        if otp_obj.is_expired():
            raise serializers.ValidationError("OTP has expired.")

        if otp_obj.attempts >= 5:
            raise serializers.ValidationError("Too many attempts. Request a new OTP.")

        if not verify_otp(attrs["otp"], otp_obj.code_hash):
            otp_obj.attempts += 1
            otp_obj.save(update_fields=["attempts"])
            raise serializers.ValidationError("Invalid email or OTP.")

        self.context["user"] = user
        self.context["otp_obj"] = otp_obj
        return attrs

    def save(self):
        user = self.context["user"]
        otp_obj = self.context["otp_obj"]

        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])

        otp_obj.is_used = True
        otp_obj.save(update_fields=["is_used"])