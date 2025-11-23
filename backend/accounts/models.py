from django.db import models

class Account(models.Model):
    acc_id = models.AutoField(primary_key=True)
    lastname = models.CharField(max_length=255)
    firstname = models.CharField(max_length=255)
    middlename = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=50, null=True, blank=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.username})"


class AccountAddress(models.Model):
    acc_add_id = models.OneToOneField('accounts.Account', primary_key=True, on_delete=models.CASCADE, related_name='address')
    house_building_number = models.CharField(max_length=255, null=True, blank=True)
    street_name = models.CharField(max_length=255, null=True, blank=True)
    subdivision_village = models.CharField(max_length=255, null=True, blank=True)
    barangay = models.CharField(max_length=255, null=True, blank=True)
    city_municipality = models.CharField(max_length=255, null=True, blank=True)
    province = models.CharField(max_length=255, null=True, blank=True)
    region = models.CharField(max_length=255, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AccountRole(models.Model):
    ROLE_CLIENT = 'client'
    ROLE_MECHANIC = 'mechanic'
    ROLE_SHOP_OWNER = 'shop_owner'
    ROLE_ADMIN = 'admin'
    ROLE_HEAD_ADMIN = 'head_admin'
    ROLE_CHOICES = [
        (ROLE_CLIENT, 'Client'),
        (ROLE_MECHANIC, 'Mechanic'),
        (ROLE_SHOP_OWNER, 'Shop Owner'),
        (ROLE_ADMIN, 'Admin'),
        (ROLE_HEAD_ADMIN, 'Head Admin'),
    ]

    acc_rol_id = models.AutoField(primary_key=True)
    acc = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='roles')
    account_role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    appointed_at = models.DateTimeField(auto_now_add=True)


class AccountWarning(models.Model):
    acc_war_id = models.AutoField(primary_key=True)
    reason_warning = models.TextField()
    issuer = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='warnings_issued')
    receiver = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='warnings_received')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AccountBan(models.Model):
    acc_ban_id = models.OneToOneField('accounts.Account', primary_key=True, on_delete=models.CASCADE, related_name='ban')
    reason_ban = models.TextField()
    banned_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PasswordReset(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_USED = 'used'
    STATUS_EXPIRED = 'expired'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_USED, 'Used'),
        (STATUS_EXPIRED, 'Expired'),
    ]

    reset_id = models.AutoField(primary_key=True)
    acc = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='password_resets')
    reset_token = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    requested_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)


class ReportAccount(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_REVIEWED = 'reviewed'
    STATUS_ACTION_TAKEN = 'action_taken'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_REVIEWED, 'Reviewed'),
        (STATUS_ACTION_TAKEN, 'Action Taken'),
    ]

    rep_acc_id = models.AutoField(primary_key=True)
    reported = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='reports_received')
    reporter = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='reports_made')
    reason = models.TextField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=STATUS_PENDING)
    reported_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    admin_action_notes = models.TextField(null=True, blank=True)


# Subtypes (one-to-one)
class Client(models.Model):
    client_id = models.OneToOneField('accounts.Account', primary_key=True, on_delete=models.CASCADE, related_name='client_profile')
    profile_photo = models.CharField(max_length=1024, null=True, blank=True)
    contact_number = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Mechanic(models.Model):
    RANKING_CHOICES = [
        ('standard', 'Standard'),
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
    ]
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('working', 'Working'),
    ]

    mechanic_id = models.OneToOneField('accounts.Account', primary_key=True, on_delete=models.CASCADE, related_name='mechanic_profile')
    profile_photo = models.CharField(max_length=1024, null=True, blank=True)
    contact_number = models.CharField(max_length=50, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    ranking = models.CharField(max_length=20, choices=RANKING_CHOICES, default='standard')
    is_working_for_shop = models.BooleanField(default=False)
    shop = models.ForeignKey('shop.Shop', on_delete=models.SET_NULL, null=True, blank=True, related_name='mechanics_assigned')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    token_wallet = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ShopOwner(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive')]

    shop_owner_id = models.OneToOneField('accounts.Account', primary_key=True, on_delete=models.CASCADE, related_name='shop_owner_profile')
    profile_photo = models.CharField(max_length=1024, null=True, blank=True)
    contact_number = models.CharField(max_length=50, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    owns_shop = models.BooleanField(default=False)
    shop = models.ForeignKey('shop.Shop', on_delete=models.SET_NULL, null=True, blank=True, related_name='owners')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    token_wallet = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Admin(models.Model):
    admin_id = models.OneToOneField('accounts.Account', primary_key=True, on_delete=models.CASCADE, related_name='admin_profile')
    profile_photo = models.CharField(max_length=1024, null=True, blank=True)
    contact_number = models.CharField(max_length=50, null=True, blank=True)
    created_by_admin = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='admins_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class HeadAdmin(models.Model):
    head_admin_id = models.OneToOneField('accounts.Account', primary_key=True, on_delete=models.CASCADE, related_name='head_admin_profile')
    profile_photo = models.CharField(max_length=1024, null=True, blank=True)
    contact_number = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    receiver = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    TYPE_CHOICES = [('info', 'Info'), ('warning', 'Warning'), ('alert', 'Alert'), ('promotional', 'Promotional')]
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='info')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TokenPurchase(models.Model):
    token_purchase_id = models.AutoField(primary_key=True)
    account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='token_purchases')
    tokens_amount = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, null=True, blank=True)
    purchased_at = models.DateTimeField(auto_now_add=True)
