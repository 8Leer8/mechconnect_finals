from django.db import models

class Account(models.Model):
    ROLE_CHOICES = [
        ('client', 'Client'),
        ('mechanic', 'Mechanic'),
        ('shop_owner', 'Shop Owner'),
        ('admin', 'Admin'),
    ]

    account_id = models.AutoField(primary_key=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    profile_picture = models.CharField(max_length=1024, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"


class Client(models.Model):
    account = models.OneToOneField(Account, primary_key=True, on_delete=models.CASCADE, related_name='client_profile')

    def __str__(self):
        return f"Client: {self.account}"


class Mechanic(models.Model):
    account = models.OneToOneField(Account, primary_key=True, on_delete=models.CASCADE, related_name='mechanic_profile')
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Mechanic: {self.account}"


class ShopOwner(models.Model):
    account = models.OneToOneField(Account, primary_key=True, on_delete=models.CASCADE, related_name='shop_owner_profile')
    shop_name = models.CharField(max_length=255)

    def __str__(self):
        return f"ShopOwner: {self.account} – {self.shop_name}"
