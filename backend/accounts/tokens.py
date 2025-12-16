"""
Email verification token generator for MechConnect.
Uses Django's default token generator with custom implementation for Account model.
"""
from django.contrib.auth.tokens import PasswordResetTokenGenerator


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """
    Token generator for email verification.
    Tokens are one-time use and expire after a set period.
    """
    
    def _make_hash_value(self, user, timestamp):
        """
        Generate hash value for token based on user's primary key, email, 
        active status, and timestamp.
        Token becomes invalid once user is activated.
        """
        return (
            str(user.acc_id) + 
            str(timestamp) +
            str(user.is_active) +
            str(user.email)
        )


# Create a single instance to use throughout the application
email_verification_token = EmailVerificationTokenGenerator()
