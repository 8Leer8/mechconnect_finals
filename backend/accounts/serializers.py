from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.contrib.auth import authenticate
from .models import (
    Account, AccountAddress, AccountRole, Client, Mechanic, 
    ShopOwner, Admin, HeadAdmin, PasswordReset, Notification
)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'] = serializers.CharField()
        self.fields['password'] = serializers.CharField()
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['acc_id'] = user.acc_id
        token['email'] = user.email
        token['username'] = user.username
        token['firstname'] = user.firstname
        token['lastname'] = user.lastname
        token['is_active'] = user.is_active
        token['is_verified'] = user.is_verified
        
        # Add role information
        primary_role = user.get_primary_role()
        token['role'] = primary_role
        
        return token
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            # Authenticate using the custom Account model
            try:
                user = Account.objects.get(username=username)
                if user.check_password(password):
                    if not user.is_active:
                        raise serializers.ValidationError('User account is disabled.')
                    
                    # Check if user is banned
                    if hasattr(user, 'ban'):
                        raise serializers.ValidationError(f'Account is banned: {user.ban.reason_ban}')
                    
                    refresh = self.get_token(user)
                    
                    return {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': AccountSerializer(user).data
                    }
                else:
                    raise serializers.ValidationError('Invalid credentials.')
            except Account.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include username and password.')


class AccountAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountAddress
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class AccountRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountRole
        fields = '__all__'
        read_only_fields = ('appointed_at',)


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('client_id', 'created_at', 'updated_at')


class MechanicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mechanic
        fields = '__all__'
        read_only_fields = ('mechanic_id', 'average_rating', 'created_at', 'updated_at')


class ShopOwnerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopOwner
        fields = '__all__'
        read_only_fields = ('shop_owner_id', 'created_at', 'updated_at')


class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = '__all__'
        read_only_fields = ('admin_id', 'created_at', 'updated_at')


class HeadAdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeadAdmin
        fields = '__all__'
        read_only_fields = ('head_admin_id', 'created_at', 'updated_at')


class AccountSerializer(serializers.ModelSerializer):
    address = AccountAddressSerializer(read_only=True)
    roles = AccountRoleSerializer(many=True, read_only=True)
    client_profile = ClientProfileSerializer(read_only=True)
    mechanic_profile = MechanicProfileSerializer(read_only=True)
    shop_owner_profile = ShopOwnerProfileSerializer(read_only=True)
    admin_profile = AdminProfileSerializer(read_only=True)
    head_admin_profile = HeadAdminProfileSerializer(read_only=True)
    
    class Meta:
        model = Account
        fields = [
            'acc_id', 'lastname', 'firstname', 'middlename', 'email', 
            'date_of_birth', 'gender', 'username', 'is_active', 'is_verified',
            'last_login', 'created_at', 'updated_at', 'address', 'roles',
            'client_profile', 'mechanic_profile', 'shop_owner_profile', 
            'admin_profile', 'head_admin_profile'
        ]
        read_only_fields = ('acc_id', 'is_verified', 'last_login', 'created_at', 'updated_at')


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=AccountRole.ROLE_CHOICES, write_only=True)
    
    # Address fields (optional)
    house_building_number = serializers.CharField(max_length=255, required=False, allow_blank=True)
    street_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    subdivision_village = serializers.CharField(max_length=255, required=False, allow_blank=True)
    barangay = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city_municipality = serializers.CharField(max_length=255, required=False, allow_blank=True)
    province = serializers.CharField(max_length=255, required=False, allow_blank=True)
    region = serializers.CharField(max_length=255, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    # Profile fields based on role
    profile_photo = serializers.CharField(max_length=1024, required=False, allow_blank=True)
    contact_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Account
        fields = [
            'lastname', 'firstname', 'middlename', 'email', 'date_of_birth', 
            'gender', 'username', 'password', 'password_confirm', 'role',
            'house_building_number', 'street_name', 'subdivision_village', 
            'barangay', 'city_municipality', 'province', 'region', 'postal_code',
            'profile_photo', 'contact_number', 'bio'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def validate_email(self, value):
        if Account.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def validate_username(self, value):
        if Account.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value
    
    def create(self, validated_data):
        # Extract non-account fields
        role = validated_data.pop('role')
        password_confirm = validated_data.pop('password_confirm')
        
        # Extract address fields
        address_fields = {
            'house_building_number': validated_data.pop('house_building_number', ''),
            'street_name': validated_data.pop('street_name', ''),
            'subdivision_village': validated_data.pop('subdivision_village', ''),
            'barangay': validated_data.pop('barangay', ''),
            'city_municipality': validated_data.pop('city_municipality', ''),
            'province': validated_data.pop('province', ''),
            'region': validated_data.pop('region', ''),
            'postal_code': validated_data.pop('postal_code', '')
        }
        
        # Extract profile fields
        profile_fields = {
            'profile_photo': validated_data.pop('profile_photo', ''),
            'contact_number': validated_data.pop('contact_number', ''),
            'bio': validated_data.pop('bio', '')
        }
        
        # Hash password
        validated_data['password'] = make_password(validated_data['password'])
        
        # Create account
        account = Account.objects.create(**validated_data)
        
        # Create address if any address field is provided
        if any(address_fields.values()):
            AccountAddress.objects.create(acc_add_id=account, **address_fields)
        
        # Create role
        AccountRole.objects.create(acc=account, account_role=role)
        
        # Create profile based on role
        if role == AccountRole.ROLE_CLIENT:
            Client.objects.create(
                client_id=account, 
                profile_photo=profile_fields['profile_photo'],
                contact_number=profile_fields['contact_number']
            )
        elif role == AccountRole.ROLE_MECHANIC:
            Mechanic.objects.create(
                mechanic_id=account,
                profile_photo=profile_fields['profile_photo'],
                contact_number=profile_fields['contact_number'],
                bio=profile_fields['bio']
            )
        elif role == AccountRole.ROLE_SHOP_OWNER:
            ShopOwner.objects.create(
                shop_owner_id=account,
                profile_photo=profile_fields['profile_photo'],
                contact_number=profile_fields['contact_number'],
                bio=profile_fields['bio']
            )
        elif role == AccountRole.ROLE_ADMIN:
            Admin.objects.create(
                admin_id=account,
                profile_photo=profile_fields['profile_photo'],
                contact_number=profile_fields['contact_number']
            )
        elif role == AccountRole.ROLE_HEAD_ADMIN:
            HeadAdmin.objects.create(
                head_admin_id=account,
                profile_photo=profile_fields['profile_photo'],
                contact_number=profile_fields['contact_number']
            )
        
        return account


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            try:
                # Try to find user by email first, then by username
                user = None
                if '@' in username:
                    # If username contains @, treat it as email
                    try:
                        user = Account.objects.get(email=username)
                    except Account.DoesNotExist:
                        pass
                
                # If not found by email or doesn't contain @, try username
                if user is None:
                    user = Account.objects.get(username=username)
                
                if not user.is_active:
                    raise serializers.ValidationError('Account is deactivated.')
                
                if not check_password(password, user.password):
                    raise serializers.ValidationError('Invalid credentials.')
                
                # Update last login
                user.last_login = timezone.now()
                user.save()
                
                attrs['user'] = user
                return attrs
            except Account.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include username and password.')


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not check_password(value, user.password):
            raise serializers.ValidationError('Current password is incorrect.')
        return value
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.password = make_password(self.validated_data['new_password'])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        try:
            Account.objects.get(email=value)
        except Account.DoesNotExist:
            raise serializers.ValidationError('No account found with this email address.')
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    reset_token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        
        try:
            reset_request = PasswordReset.objects.get(
                reset_token=attrs['reset_token'],
                status=PasswordReset.STATUS_PENDING
            )
            if reset_request.expires_at and reset_request.expires_at < timezone.now():
                raise serializers.ValidationError('Reset token has expired.')
            
            attrs['reset_request'] = reset_request
        except PasswordReset.DoesNotExist:
            raise serializers.ValidationError('Invalid or expired reset token.')
        
        return attrs
    
    def save(self, **kwargs):
        reset_request = self.validated_data['reset_request']
        user = reset_request.acc
        
        # Update password
        user.password = make_password(self.validated_data['new_password'])
        user.save()
        
        # Mark reset token as used
        reset_request.status = PasswordReset.STATUS_USED
        reset_request.used_at = timezone.now()
        reset_request.save()
        
        return user


class MechanicDiscoverySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile_photo = serializers.CharField(source='mechanic_profile.profile_photo')
    bio = serializers.CharField(source='mechanic_profile.bio')
    average_rating = serializers.DecimalField(source='mechanic_profile.average_rating', max_digits=3, decimal_places=2, read_only=True)
    ranking = serializers.CharField(source='mechanic_profile.ranking')
    location = serializers.SerializerMethodField()
    total_jobs = serializers.SerializerMethodField()
    contact_number = serializers.CharField(source='mechanic_profile.contact_number')
    status = serializers.CharField(source='mechanic_profile.status')
    
    class Meta:
        model = Account
        fields = [
            'acc_id', 'full_name', 'profile_photo', 'bio', 'average_rating', 
            'ranking', 'location', 'total_jobs', 'contact_number', 'status'
        ]
    
    def get_full_name(self, obj):
        """Get formatted full name"""
        middle_initial = f" {obj.middlename[0]}." if obj.middlename else ""
        return f"{obj.firstname}{middle_initial} {obj.lastname}"
    
    def get_location(self, obj):
        """Get formatted location from address"""
        if hasattr(obj, 'address') and obj.address:
            address = obj.address
            # Create a readable location string
            location_parts = []
            if address.city_municipality:
                location_parts.append(address.city_municipality)
            if address.province:
                location_parts.append(address.province)
            return ", ".join(location_parts) if location_parts else "Location not specified"
        return "Location not specified"
    
    def get_total_jobs(self, obj):
        """Get total completed jobs - placeholder for now"""
        # This would need to be implemented based on your requests/jobs model
        # For now, return a placeholder number based on rating count estimation
        if hasattr(obj, 'mechanic_profile') and obj.mechanic_profile.average_rating:
            # Estimate based on rating - this is just a placeholder
            return max(1, int(obj.mechanic_profile.average_rating * 50))  # Rough estimation
        return 0


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('notification_id', 'created_at', 'updated_at')
