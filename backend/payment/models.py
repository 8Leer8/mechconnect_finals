from django.db import models
from requests.models import Request

class Payment(models.Model):
    payment_id = models.AutoField(primary_key=True)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.payment_id} for Request {self.request_id}"
