# User Management API Documentation

## Overview
This document provides comprehensive documentation for the User Management API endpoints. All endpoints require admin authentication using JWT Bearer token.

**Base URL:** `http://localhost:8000/api/v1/admin`

## Authentication
All endpoints require authentication using JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get All Users
**GET** `/users`

Retrieve a paginated list of users with optional filtering and search.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search by name, email, or phone |
| `role` | string | No | Filter by role: `admin`, `customer` |
| `sort_by` | string | No | Sort field (default: `created_at`) |
| `sort_direction` | string | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `per_page` | integer | No | Items per page (default: 15) |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users?search=admin&role=admin&per_page=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Admin",
        "email": "admin@soapyshop.com",
        "phone": "+96512345678",
        "role": "admin",
        "is_active": 1,
        "created_at": "2025-10-06T08:56:24.000000Z",
        "updated_at": "2025-10-06T08:56:24.000000Z"
      },
      {
        "id": 2,
        "name": "مدير جديد",
        "email": "admin2@soapyshop.com",
        "phone": "+96512345679",
        "role": "admin",
        "is_active": 1,
        "created_at": "2025-10-08T14:19:44.000000Z",
        "updated_at": "2025-10-08T14:20:27.000000Z"
      }
    ],
    "first_page_url": "http://localhost:8000/api/v1/admin/users?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/v1/admin/users?page=1",
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "page": null,
        "active": false
      },
      {
        "url": "http://localhost:8000/api/v1/admin/users?page=1",
        "label": "1",
        "page": 1,
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "page": null,
        "active": false
      }
    ],
    "next_page_url": null,
    "path": "http://localhost:8000/api/v1/admin/users",
    "per_page": 15,
    "prev_page_url": null,
    "to": 2,
    "total": 2
  },
  "message": "Users retrieved successfully"
}
```

### 2. Create User
**POST** `/users`

Create a new user account.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | User's full name |
| `email` | string | Yes | User's email address (must be unique) |
| `phone` | string | No | User's phone number |
| `password` | string | Yes | User's password (minimum 6 characters) |
| `role` | string | Yes | User role: `admin` or `customer` |
| `is_active` | boolean | No | Active status (default: true) |

#### Example Request
```bash
curl -X POST "http://localhost:8000/api/v1/admin/users" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -d '{
    "name": "مدير جديد",
    "email": "admin2@soapyshop.com",
    "phone": "+96512345679",
    "password": "admin123",
    "role": "admin",
    "is_active": true
  }'
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "مدير جديد",
    "email": "admin2@soapyshop.com",
    "phone": "+96512345679",
    "role": "admin",
    "is_active": 1,
    "created_at": "2025-10-08T14:19:44.000000Z",
    "updated_at": "2025-10-08T14:19:44.000000Z"
  },
  "message": "User created successfully"
}
```

### 3. Get User Details
**GET** `/users/{id}`

Retrieve detailed information about a specific user.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users/1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@soapyshop.com",
    "phone": "+96512345678",
    "role": "admin",
    "is_active": 1,
    "created_at": "2025-10-06T08:56:24.000000Z",
    "updated_at": "2025-10-06T08:56:24.000000Z"
  },
  "message": "User retrieved successfully"
}
```

### 4. Update User
**PUT** `/users/{id}`

Update user information.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID |

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | User's full name |
| `email` | string | No | User's email address (must be unique) |
| `phone` | string | No | User's phone number |
| `password` | string | No | User's password (minimum 6 characters) |
| `role` | string | No | User role: `admin` or `customer` |
| `is_active` | boolean | No | Active status |

#### Example Request
```bash
curl -X PUT "http://localhost:8000/api/v1/admin/users/2" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -d '{
    "name": "مدير محدث",
    "phone": "+96512345680",
    "is_active": false
  }'
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "مدير محدث",
    "email": "admin2@soapyshop.com",
    "phone": "+96512345680",
    "role": "admin",
    "is_active": 0,
    "created_at": "2025-10-08T14:19:44.000000Z",
    "updated_at": "2025-10-08T14:20:27.000000Z"
  },
  "message": "User updated successfully"
}
```

### 5. Delete User
**DELETE** `/users/{id}`

Delete a user account. Cannot delete the last admin user.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID |

#### Example Request
```bash
curl -X DELETE "http://localhost:8000/api/v1/admin/users/2" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Error Response (Last Admin)
```json
{
  "success": false,
  "message": "Cannot delete the last admin user"
}
```

### 6. Toggle User Status
**PUT** `/users/{id}/toggle-status`

Toggle user active/inactive status. Cannot deactivate the last active admin.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID |

#### Example Request
```bash
curl -X PUT "http://localhost:8000/api/v1/admin/users/2/toggle-status" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "مدير محدث",
    "email": "admin2@soapyshop.com",
    "phone": "+96512345680",
    "role": "admin",
    "is_active": 1,
    "created_at": "2025-10-08T14:19:44.000000Z",
    "updated_at": "2025-10-08T14:20:36.000000Z"
  },
  "message": "User status updated successfully"
}
```

#### Error Response (Last Active Admin)
```json
{
  "success": false,
  "message": "Cannot deactivate the last active admin user"
}
```

### 7. Change User Password
**PUT** `/users/{id}/change-password`

Change user password.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID |

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | Yes | New password (minimum 6 characters) |
| `password_confirmation` | string | Yes | Password confirmation |

#### Example Request
```bash
curl -X PUT "http://localhost:8000/api/v1/admin/users/2/change-password" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -d '{
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
  }'
```

#### Example Response
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 8. Get User Statistics
**GET** `/users/statistics`

Get comprehensive user statistics.

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users/statistics" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "total_users": 2,
    "admin_users": 2,
    "customer_users": 0,
    "active_users": 2,
    "inactive_users": 0,
    "users_this_month": 2,
    "users_this_year": 2
  },
  "message": "User statistics retrieved successfully"
}
```

### 9. Bulk Update Users
**POST** `/users/bulk-update`

Perform bulk operations on multiple users.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_ids` | array | Yes | Array of user IDs to update |
| `action` | string | Yes | Action to perform: `activate`, `deactivate`, `delete`, `change_role` |
| `role` | string | No | New role (required if action is `change_role`) |

#### Example Request
```bash
curl -X POST "http://localhost:8000/api/v1/admin/users/bulk-update" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -d '{
    "user_ids": [1, 2],
    "action": "activate"
  }'
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "updated_count": 2
  },
  "message": "Bulk activate completed successfully"
}
```

#### Error Response (Cannot Delete All Admins)
```json
{
  "success": false,
  "message": "Error performing bulk update: Cannot delete all admin users"
}
```

### 10. Export Users
**GET** `/users/export`

Export users data in various formats.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | Export format: `json`, `csv`, `xlsx` (default: `json`) |
| `role` | string | No | Filter by role: `admin`, `customer` |
| `is_active` | boolean | No | Filter by active status |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users/export?format=json&role=admin" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response (JSON)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "email": "admin@soapyshop.com",
      "phone": "+96512345678",
      "role": "admin",
      "is_active": 1,
      "created_at": "2025-10-06T08:56:24.000000Z",
      "updated_at": "2025-10-06T08:56:24.000000Z"
    },
    {
      "id": 2,
      "name": "مدير محدث",
      "email": "admin2@soapyshop.com",
      "phone": "+96512345680",
      "role": "admin",
      "is_active": 1,
      "created_at": "2025-10-08T14:19:44.000000Z",
      "updated_at": "2025-10-08T14:20:36.000000Z"
    }
  ],
  "message": "Users exported successfully"
}
```

#### Example Response (CSV)
The CSV export returns a downloadable file with headers:
```
ID,Name,Email,Phone,Role,Is Active,Created At
1,Admin,admin@soapyshop.com,+96512345678,admin,Yes,2025-10-06 08:56:24
2,مدير محدث,admin2@soapyshop.com,+96512345680,admin,Yes,2025-10-08 14:19:44
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email must be a valid email address."],
    "password": ["The password must be at least 6 characters."]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthenticated. Please login.",
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "message": "Cannot delete the last admin user"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving users",
  "error": "Database connection failed"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

## Security Notes

1. **Password Requirements**: Passwords must be at least 6 characters long
2. **Admin Protection**: The system prevents deletion of the last admin user
3. **Active Admin Protection**: The system prevents deactivation of the last active admin user
4. **Email Uniqueness**: Email addresses must be unique across all users
5. **Role Validation**: Only `admin` and `customer` roles are allowed
6. **Bulk Operations**: Bulk operations include safety checks to prevent system lockout

## Data Validation

### User Creation/Update
- `name`: Required, string, max 255 characters
- `email`: Required, valid email format, unique
- `phone`: Optional, string, max 20 characters
- `password`: Required for creation, optional for update, min 6 characters
- `role`: Required, must be `admin` or `customer`
- `is_active`: Optional boolean, defaults to true

### Password Change
- `password`: Required, min 6 characters
- `password_confirmation`: Required, must match password

### Bulk Operations
- `user_ids`: Required array, must contain valid user IDs
- `action`: Required, must be one of: `activate`, `deactivate`, `delete`, `change_role`
- `role`: Required if action is `change_role`, must be `admin` or `customer`

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. User IDs are auto-incrementing integers
3. Passwords are automatically hashed using Laravel's Hash facade
4. The `is_active` field uses integer values (1 for active, 0 for inactive)
5. Email addresses are case-insensitive and must be unique
6. Phone numbers are stored as strings to preserve formatting
7. Bulk operations are performed within database transactions for data integrity
8. Export functionality supports JSON, CSV, and XLSX formats (XLSX requires additional package)
