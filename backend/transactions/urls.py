from django.urls import path
from .views import PurchaseTokenView

app_name = "transactions"

urlpatterns = [
    path("purchase-token/", PurchaseTokenView.as_view(), name="purchase-token"),
]