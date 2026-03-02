from decimal import Decimal
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import PaymentTransaction, TokenPurchase
from .serializers import PurchaseTokenSerializer, TokenPurchaseSerializer
from .utils import generate_unique_token
from notifications.models import Notification

PRICE_PER_UNIT_RWF = Decimal("100.00")


class PurchaseTokenView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        # 1) Validate input
        serializer = PurchaseTokenSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        meter = serializer.validated_data["meter"]
        amount = serializer.validated_data["amount_rwf"]
        method = serializer.validated_data["method"]
        ext_ref = serializer.validated_data.get("external_reference")

        # 2) Lock meter row to prevent race conditions
        meter = meter.__class__.objects.select_for_update().get(pk=meter.pk)

        # 3) Create payment as PENDING
        payment = PaymentTransaction.objects.create(
            user=request.user,
            meter=meter,
            amount_rwf=amount,
            method=method,
            status=PaymentTransaction.Status.PENDING,
            external_reference=ext_ref
        )

        # 4) Simulate confirmation — mark as SUCCESS
        payment.status = PaymentTransaction.Status.SUCCESS
        payment.save(update_fields=["status"])

        # 5) Calculate units
        units = (amount / PRICE_PER_UNIT_RWF).quantize(Decimal("0.001"))

        # 6) Generate unique token
        token = generate_unique_token(TokenPurchase)

        # 7) Create token purchase record
        token_purchase = TokenPurchase.objects.create(
            payment=payment,
            meter=meter,
            units_generated=units,
            token_generated=token,
            status=TokenPurchase.Status.DELIVERED
        )

        # 8) Update meter balance
        meter.current_balance_units = (
            meter.current_balance_units + units
        ).quantize(Decimal("0.001"))
        meter.save(update_fields=["current_balance_units", "updated_at"])

        # 9) Payment success notification
        Notification.objects.create(
            user=request.user,
            meter=meter,
            notification_type=Notification.Type.PAYMENT,  # ✅ not "type"
            title="Token Purchase Successful",
            message=(
                f"You purchased {units} units for meter {meter.meter_number}. "
                f"Token: {token}. New balance: {meter.current_balance_units} units."
            )
        )

        # 10) Low balance notification
        if meter.is_low_balance:
            Notification.objects.create(
                user=request.user,
                meter=meter,
                notification_type=Notification.Type.LOW_BALANCE,  # ✅ not "type"
                title="Low Balance Alert",
                message=(
                    f"Your meter '{meter.name}' is low on units. "
                    f"Remaining: {meter.current_balance_units} units."
                )
            )

        # 11) Return structured response
        return Response(
            {
                "payment_id": str(payment.id),
                "meter": str(meter.id),
                "token": token_purchase.token_generated,
                "units": str(token_purchase.units_generated),
                "new_balance_units": str(meter.current_balance_units),
                "low_balance": meter.is_low_balance,
            },
            status=status.HTTP_201_CREATED
        )