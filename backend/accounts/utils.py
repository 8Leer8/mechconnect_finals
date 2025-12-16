"""
Email utility functions for MechConnect.
Handles sending verification and notification emails.
"""
from django.core.mail import EmailMessage
from django.core.cache import cache
from django.conf import settings
import random
import string


def generate_otp():
    """
    Generate a random 6-digit OTP code.
    
    Returns:
        str: 6-digit numeric code
    """
    return ''.join(random.choices(string.digits, k=6))


def send_verification_email(user, request=None):
    """
    Send 6-digit OTP code to newly registered users.
    Stores OTP in cache with 10-minute expiry.
    
    Args:
        user: Account model instance
        request: HTTP request object (optional, not used for OTP)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Generate 6-digit OTP
        otp_code = generate_otp()
        
        # Store OTP in cache with 10-minute expiry (600 seconds)
        cache_key = f'email_verification_{user.acc_id}'
        cache.set(cache_key, otp_code, timeout=600)
        
        # Email subject
        subject = 'Verify Your MechConnect Account'
        
        # Email body
        message = f"""
Hello {user.firstname} {user.lastname},

Welcome to MechConnect! Please verify your email address to activate your account.

Your verification code is:

    {otp_code}

This code will expire in 10 minutes.

If you didn't create an account with MechConnect, please ignore this email.

Best regards,
The MechConnect Team
"""
        
        # Create and send email
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        
        email.send(fail_silently=False)
        return True
        
    except Exception as e:
        print(f"Error sending verification email: {str(e)}")
        return False


def send_email_verification_otp(email_address):
    """
    Send 6-digit OTP code to an email address BEFORE user registration.
    This is used for pre-registration email verification.
    Stores OTP in cache with 10-minute expiry.
    
    Args:
        email_address: Email address to send OTP to
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Generate 6-digit OTP
        otp_code = generate_otp()
        
        # Store OTP in cache using email as key (10-minute expiry)
        cache_key = f'pre_registration_otp_{email_address.lower()}'
        cache.set(cache_key, otp_code, timeout=600)
        
        # Email subject
        subject = 'MechConnect - Verify Your Email Address'
        
        # Email body
        message = f"""
Hello,

You're signing up for MechConnect! Please verify your email address using the code below.

Your verification code is:

    {otp_code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
The MechConnect Team
"""
        
        # Create and send email
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email_address]
        )
        
        email.send(fail_silently=False)
        return True
        
    except Exception as e:
        print(f"Error sending pre-registration OTP: {str(e)}")
        return False


def verify_email_otp(email_address, code):
    """
    Verify 6-digit OTP code for pre-registration email verification.
    
    Args:
        email_address: Email address that received the OTP
        code: 6-digit OTP code to verify
    
    Returns:
        dict: {'success': bool, 'error': str or None}
    """
    try:
        # Get OTP from cache
        cache_key = f'pre_registration_otp_{email_address.lower()}'
        stored_code = cache.get(cache_key)
        
        if not stored_code:
            return {'success': False, 'error': 'Verification code has expired. Please request a new code.'}
        
        if stored_code != code:
            return {'success': False, 'error': 'Invalid verification code. Please check and try again.'}
        
        # Mark email as verified in cache (valid for 30 minutes for registration)
        verified_key = f'email_verified_{email_address.lower()}'
        cache.set(verified_key, True, timeout=1800)  # 30 minutes
        
        # Delete OTP from cache (one-time use)
        cache.delete(cache_key)
        
        return {'success': True, 'error': None}
        
    except Exception as e:
        print(f"Error verifying OTP: {str(e)}")
        return {'success': False, 'error': 'An error occurred during verification. Please try again.'}


def is_email_verified(email_address):
    """
    Check if an email has been verified for registration.
    
    Args:
        email_address: Email address to check
    
    Returns:
        bool: True if email is verified, False otherwise
    """
    cache_key = f'email_verified_{email_address.lower()}'
    return cache.get(cache_key, False)


def send_password_reset_otp(email_address):
    """
    Send 6-digit OTP code for password reset.
    Stores OTP in cache with 10-minute expiry.
    
    Args:
        email_address: Email address to send OTP to
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Generate 6-digit OTP
        otp_code = generate_otp()
        
        # Store OTP in cache using email as key (10-minute expiry)
        cache_key = f'password_reset_otp_{email_address.lower()}'
        cache.set(cache_key, otp_code, timeout=600)
        
        # Email subject
        subject = 'MechConnect - Reset Your Password'
        
        # Email body
        message = f"""
Hello,

You requested to reset your MechConnect password. Please use the verification code below to proceed.

Your password reset code is:

    {otp_code}

This code will expire in 10 minutes.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
The MechConnect Team
"""
        
        # Create and send email
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email_address]
        )
        
        email.send(fail_silently=False)
        return True
        
    except Exception as e:
        print(f"Error sending password reset OTP: {str(e)}")
        return False


def verify_password_reset_otp(email_address, code):
    """
    Verify 6-digit OTP code for password reset.
    
    Args:
        email_address: Email address that received the OTP
        code: 6-digit OTP code to verify
    
    Returns:
        dict: {'success': bool, 'error': str or None}
    """
    try:
        # Get OTP from cache
        cache_key = f'password_reset_otp_{email_address.lower()}'
        stored_code = cache.get(cache_key)
        
        if not stored_code:
            return {'success': False, 'error': 'Verification code has expired. Please request a new code.'}
        
        if stored_code != code:
            return {'success': False, 'error': 'Invalid verification code. Please check and try again.'}
        
        # Mark code as verified in cache (valid for 15 minutes for password reset)
        verified_key = f'password_reset_verified_{email_address.lower()}'
        cache.set(verified_key, True, timeout=900)  # 15 minutes
        
        # Delete OTP from cache (one-time use)
        cache.delete(cache_key)
        
        return {'success': True, 'error': None}
        
    except Exception as e:
        print(f"Error verifying password reset OTP: {str(e)}")
        return {'success': False, 'error': 'An error occurred during verification. Please try again.'}


def is_password_reset_verified(email_address):
    """
    Check if password reset OTP has been verified.
    
    Args:
        email_address: Email address to check
    
    Returns:
        bool: True if OTP is verified, False otherwise
    """
    cache_key = f'password_reset_verified_{email_address.lower()}'
    return cache.get(cache_key, False)

