from django.db import models

class TokenPurchase(models.Model):
    token_purchase_id = models.AutoField(primary_key=True)
    account = models.ForeignKey(
        'accounts.Account',
        on_delete=models.CASCADE,
        related_name='payment_token_purchases'  
    )
    tokens_amount = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, null=True, blank=True)
    purchased_at = models.DateTimeField(auto_now_add=True)


class Payment(models.Model):
    payment_id = models.AutoField(primary_key=True)
    request = models.ForeignKey('requests.Request', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
