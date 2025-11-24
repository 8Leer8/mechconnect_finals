# MechConnect Authentication API

This document provides comprehensive information about the authentication system for the MechConnect application.

## Overview

The authentication system supports multiple user roles:
- **Client**: Regular users seeking mechanical services
- **Mechanic**: Service providers offering mechanical expertise
- **Shop Owner**: Business owners managing repair shops
- **Admin**: System administrators with elevated privileges
- **Head Admin**: Super administrators with full system access

## API Endpoints

Base URL: `http://localhost:8000/api/accounts/`

### Authentication Endpoints

#### 1. Register User
**POST** `/register/`

Register a new user account with role-based profile creation.

**Request Body:**
```json
{
    "firstname": "John",
    "lastname": "Doe",
    "middlename": "Smith",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "role": "client",
    "date_of_birth": "1990-01-01",
    "gender": "Male",
    "contact_number": "+1234567890",
    "profile_photo": "https://example.com/photo.jpg",
    "bio": "Brief description about the user",
    "house_building_number": "123",
    "street_name": "Main Street",
    "barangay": "Barangay Name",
    "city_municipality": "City Name",
    "province": "Province Name",
    "region": "Region Name",
    "postal_code": "12345"
}
```

**Required Fields:**
- firstname, lastname, email, username, password, password_confirm, role

**Role Options:**
- `client`, `mechanic`, `shop_owner`, `admin`, `head_admin`

**Response (Success):**
```json
{
    "message": "Account created successfully",
    "user": {
        "acc_id": 1,
        "firstname": "John",
        "lastname": "Doe",
        "email": "john.doe@example.com",
        "username": "johndoe",
        "is_active": true,
        "is_verified": false,
        "roles": [
            {
                "account_role": "client",
                "appointed_at": "2025-11-23T10:00:00Z"
            }
        ]
    }
}
```

#### 2. Login
**POST** `/login/`

Authenticate user and return user data.

**Request Body:**
```json
{
    "username": "johndoe",
    "password": "securepassword123"
}
```

**Response (Success):**
```json
{
    "message": "Login successful",
    "user": {
        "acc_id": 1,
        "firstname": "John",
        "lastname": "Doe",
        "email": "john.doe@example.com",
        "username": "johndoe",
        "is_active": true,
        "is_verified": false,
        "last_login": "2025-11-23T10:00:00Z",
        "roles": [...],
        "client_profile": {...}
    }
}
```

#### 3. Get Profile
**GET** `/profile/?user_id=1`

Get current user profile information.

**Query Parameters:**
- `user_id`: User ID (required for demo purposes)

**Response:**
```json
{
    "user": {
        "acc_id": 1,
        "firstname": "John",
        "lastname": "Doe",
        "email": "john.doe@example.com",
        "address": {
            "house_building_number": "123",
            "street_name": "Main Street",
            "barangay": "Barangay Name"
        },
        "roles": [...],
        "client_profile": {
            "profile_photo": "https://example.com/photo.jpg",
            "contact_number": "+1234567890"
        }
    }
}
```

#### 4. Update Profile
**PUT** `/profile/update/`

Update user profile information.

**Request Body:**
```json
{
    "user_id": 1,
    "firstname": "John Updated",
    "lastname": "Doe Updated",
    "email": "john.updated@example.com"
}
```

### Password Management

#### 1. Change Password
**POST** `/password/change/`

Change user password (requires authentication).

**Request Body:**
```json
{
    "user_id": 1,
    "old_password": "oldpassword123",
    "new_password": "newpassword123",
    "new_password_confirm": "newpassword123"
}
```

#### 2. Password Reset Request
**POST** `/password/reset/request/`

Request a password reset token.

**Request Body:**
```json
{
    "email": "john.doe@example.com"
}
```

**Response:**
```json
{
    "message": "Password reset token generated",
    "reset_token": "uuid-token-here",
    "note": "In production, this token would be sent via email"
}
```

#### 3. Password Reset Confirm
**POST** `/password/reset/confirm/`

Confirm password reset with token.

**Request Body:**
```json
{
    "reset_token": "uuid-token-here",
    "new_password": "newpassword123",
    "new_password_confirm": "newpassword123"
}
```

### User Management (Admin Functions)

#### 1. Get Users List
**GET** `/users/`

Get paginated list of users with filtering options.

**Query Parameters:**
- `role`: Filter by role (client, mechanic, etc.)
- `is_active`: Filter by active status (true/false)
- `is_verified`: Filter by verification status (true/false)
- `page`: Page number (default: 1)
- `page_size`: Results per page (default: 20)

**Response:**
```json
{
    "users": [...],
    "total_count": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
}
```

#### 2. Get User by ID
**GET** `/users/{user_id}/`

Get specific user information by ID.

#### 3. Deactivate User
**PUT** `/users/{user_id}/deactivate/`

Deactivate a user account.

#### 4. Activate User
**PUT** `/users/{user_id}/activate/`

Activate a user account.

#### 5. Verify User
**PUT** `/users/{user_id}/verify/`

Verify a user account.

### Notifications

#### 1. Get User Notifications
**GET** `/notifications/?user_id=1`

Get notifications for a user.

**Query Parameters:**
- `user_id`: User ID (required)
- `is_read`: Filter by read status (true/false)
- `type`: Filter by notification type (info, warning, alert, promotional)

#### 2. Mark Notification as Read
**PUT** `/notifications/{notification_id}/read/`

Mark a specific notification as read.

### Health Check

#### Health Check
**GET** `/health/`

Check API health status.

**Response:**
```json
{
    "status": "healthy",
    "timestamp": "2025-11-23T10:00:00Z",
    "service": "MechConnect Authentication API"
}
```

## Data Models

### Account
Main user account model with basic information:
- `acc_id`: Primary key
- `firstname`, `lastname`, `middlename`: Name fields
- `email`: Unique email address
- `username`: Unique username
- `password`: Hashed password
- `is_active`: Account status
- `is_verified`: Verification status
- `last_login`: Last login timestamp

### Role-Based Profiles
Each user role has a dedicated profile model:
- **Client**: Basic profile with photo and contact
- **Mechanic**: Includes bio, rating, ranking, shop assignment
- **Shop Owner**: Includes bio, shop ownership status
- **Admin**: Administrative profile
- **Head Admin**: Super admin profile

### Additional Models
- **AccountAddress**: User address information
- **AccountRole**: User role assignments
- **PasswordReset**: Password reset tokens
- **Notification**: User notifications
- **TokenPurchase**: Token wallet transactions

## Security Features

1. **Password Hashing**: Uses Django's built-in password hashing
2. **Input Validation**: Comprehensive validation using DRF serializers
3. **Permission Classes**: Role-based access control
4. **Account Status Checks**: Active/inactive and banned account verification
5. **Password Reset Tokens**: Secure token-based password reset with expiration

## Error Handling

All endpoints return consistent error responses:

```json
{
    "error": "Error type",
    "details": "Detailed error message or validation errors"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (banned or insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Testing the API

You can test the API using tools like Postman, curl, or any HTTP client.

### Example: Register and Login Flow

1. **Register a new user:**
```bash
curl -X POST http://localhost:8000/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "role": "client"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

3. **Get Profile:**
```bash
curl -X GET "http://localhost:8000/api/accounts/profile/?user_id=1"
```

## Next Steps

1. **JWT Authentication**: Implement JWT tokens for stateless authentication
2. **Email Integration**: Add email verification and password reset emails
3. **Rate Limiting**: Implement rate limiting for security
4. **Logging**: Add comprehensive logging for audit trails
5. **API Documentation**: Generate OpenAPI/Swagger documentation
6. **Unit Tests**: Create comprehensive test suites

## Notes

- The current implementation uses basic authentication for demo purposes
- In production, implement proper JWT or session-based authentication
- Password reset tokens are returned in the response for testing - remove this in production
- Add proper permission checks for admin functions
- Implement comprehensive input sanitization and validation