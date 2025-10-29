# Customer Management API Documentation

## Overview
This document provides comprehensive documentation for the Customer Management API endpoints. All endpoints require admin authentication using JWT Bearer token.

**Base URL:** `http://localhost:8000/api/v1/admin`

## Authentication
All endpoints require authentication using JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get All Customers
**GET** `/customers`

Retrieve a paginated list of customers with optional filtering and search.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search by name, phone, or email |
| `status` | string | No | Filter by status: `active`, `vip`, `new`, `inactive` |
| `min_spent` | number | No | Minimum total spent amount |
| `max_spent` | number | No | Maximum total spent amount |
| `date_from` | date | No | Filter customers created from this date |
| `date_to` | date | No | Filter customers created to this date |
| `sort_by` | string | No | Sort field (default: `created_at`) |
| `sort_order` | string | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `per_page` | integer | No | Items per page (default: 15) |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/customers?search=محمد&status=active&per_page=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "customers": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "name": "محمد حامد",
          "phone": "01062532581",
          "email": null,
          "address": {
            "street": "شارع 27",
            "city": "مشرف",
            "governorate": "محافظة حولي",
            "postal_code": null
          },
          "date_of_birth": null,
          "gender": null,
          "nationality": null,
          "preferred_language": "ar",
          "is_active": true,
          "email_verified": false,
          "phone_verified": false,
          "last_order_at": null,
          "total_orders": 0,
          "total_spent": "0.000",
          "average_order_value": "0.000",
          "preferences": null,
          "notes": null,
          "created_at": "2025-10-06T12:29:16.000000Z",
          "updated_at": "2025-10-08T13:28:34.000000Z",
          "latest_order": {
            "id": 2,
            "order_number": "9220645",
            "total_amount": "436.000",
            "status": "paid",
            "created_at": "2025-10-08T13:28:34.000000Z"
          }
        }
      ],
      "first_page_url": "http://localhost:8000/api/v1/admin/customers?page=1",
      "from": 1,
      "last_page": 1,
      "last_page_url": "http://localhost:8000/api/v1/admin/customers?page=1",
      "links": [...],
      "next_page_url": null,
      "path": "http://localhost:8000/api/v1/admin/customers",
      "per_page": 15,
      "prev_page_url": null,
      "to": 1,
      "total": 1
    },
    "summary": {
      "total_customers": 1,
      "active_customers": 1,
      "vip_customers": 0,
      "new_customers": 1,
      "total_revenue": "0.000",
      "average_order_value": "0.0000000"
    }
  },
  "message": "Customers retrieved successfully"
}
```

### 2. Get Customer Details
**GET** `/customers/{id}`

Retrieve detailed information about a specific customer including order history.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Customer ID |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/customers/1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "name": "محمد حامد",
      "phone": "01062532581",
      "email": null,
      "address": {
        "street": "شارع 27",
        "city": "مشرف",
        "governorate": "محافظة حولي",
        "postal_code": null
      },
      "date_of_birth": null,
      "gender": null,
      "nationality": null,
      "preferred_language": "ar",
      "is_active": true,
      "email_verified": false,
      "phone_verified": false,
      "last_order_at": null,
      "total_orders": 0,
      "total_spent": "0.000",
      "average_order_value": "0.000",
      "preferences": null,
      "notes": null,
      "created_at": "2025-10-06T12:29:16.000000Z",
      "updated_at": "2025-10-08T13:28:34.000000Z",
      "orders": [
        {
          "id": 1,
          "order_number": "5155586",
          "total_amount": "65.250",
          "status": "paid",
          "created_at": "2025-10-06T12:29:16.000000Z",
          "order_items": [
            {
              "id": 1,
              "product_id": 9,
              "product_price": "15.500",
              "quantity": 1,
              "product_snapshot": {
                "title": "أحمر شفاه مات طويل الثبات",
                "price": "15.500",
                "currency": "KWD"
              }
            }
          ]
        }
      ],
      "latest_order": {
        "id": 2,
        "order_number": "9220645",
        "total_amount": "436.000",
        "status": "paid",
        "created_at": "2025-10-08T13:28:34.000000Z"
      }
    },
    "order_history": [
      {
        "id": 2,
        "order_number": "9220645",
        "total_amount": "436.000",
        "status": "paid",
        "created_at": "2025-10-08T13:28:34.000000Z"
      },
      {
        "id": 1,
        "order_number": "5155586",
        "total_amount": "65.250",
        "status": "paid",
        "created_at": "2025-10-06T12:29:16.000000Z"
      }
    ],
    "statistics": {
      "total_orders": 0,
      "total_spent": "0.000",
      "average_order_value": "0.000",
      "last_order_date": null,
      "customer_since": "2025-10-06T12:29:16.000000Z",
      "is_vip": false,
      "is_new": true,
      "is_active": false
    },
    "preferences": []
  },
  "message": "Customer details retrieved successfully"
}
```

### 3. Update Customer
**PUT** `/customers/{id}`

Update customer information.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Customer ID |

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Customer name |
| `email` | string | No | Customer email |
| `phone` | string | No | Customer phone |
| `address` | object | No | Customer address |
| `date_of_birth` | date | No | Date of birth |
| `gender` | string | No | Gender: `male`, `female`, `other` |
| `nationality` | string | No | Nationality |
| `preferred_language` | string | No | Preferred language |
| `is_active` | boolean | No | Active status |
| `notes` | string | No | Admin notes |

#### Example Request
```bash
curl -X PUT "http://localhost:8000/api/v1/admin/customers/1" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -d '{
    "name": "محمد حامد المحدث",
    "notes": "عميل VIP"
  }'
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "محمد حامد المحدث",
    "phone": "01062532581",
    "email": null,
    "address": {
      "street": "شارع 27",
      "city": "مشرف",
      "governorate": "محافظة حولي",
      "postal_code": null
    },
    "date_of_birth": null,
    "gender": null,
    "nationality": null,
    "preferred_language": "ar",
    "is_active": true,
    "email_verified": false,
    "phone_verified": false,
    "last_order_at": null,
    "total_orders": 0,
    "total_spent": "0.000",
    "average_order_value": "0.000",
    "preferences": null,
    "notes": "عميل VIP",
    "created_at": "2025-10-06T12:29:16.000000Z",
    "updated_at": "2025-10-08T14:17:59.000000Z"
  },
  "message": "Customer updated successfully"
}
```

### 4. Deactivate Customer
**PUT** `/customers/{id}/deactivate`

Deactivate a customer account.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Customer ID |

#### Example Request
```bash
curl -X PUT "http://localhost:8000/api/v1/admin/customers/1/deactivate" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "message": "Customer deactivated successfully"
}
```

### 5. Get Customer Analytics
**GET** `/customers/analytics`

Get comprehensive customer analytics and statistics.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | integer | No | Analysis period in days (default: 30) |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/customers/analytics?period=30" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_customers": 1,
      "active_customers": 1,
      "new_customers": 1,
      "vip_customers": 0,
      "recent_customers": 0
    },
    "period_stats": {
      "new_customers_count": 1,
      "total_revenue": 0,
      "average_order_value": null,
      "customer_retention_rate": 0
    },
    "customer_segments": {
      "new_customers": 1,
      "returning_customers": 0,
      "vip_customers": 0,
      "inactive_customers": 0
    },
    "top_customers": [],
    "customer_growth": [
      {
        "date": "2025-09-08",
        "customers": 0
      },
      {
        "date": "2025-10-06",
        "customers": 1
      }
    ],
    "lifetime_value_distribution": {
      "0-50": 1,
      "50-100": 0,
      "100-250": 0,
      "250-500": 0,
      "500+": 0
    }
  },
  "message": "Customer analytics retrieved successfully"
}
```

### 6. Search Customers
**GET** `/customers/search`

Search customers by name, phone, or email.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `limit` | integer | No | Maximum results (default: 20) |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/customers/search?q=01062532581&limit=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "محمد حامد",
      "phone": "01062532581",
      "email": null,
      "address": {
        "street": "شارع 27",
        "city": "مشرف",
        "governorate": "محافظة حولي",
        "postal_code": null
      },
      "date_of_birth": null,
      "gender": null,
      "nationality": null,
      "preferred_language": "ar",
      "is_active": true,
      "email_verified": false,
      "phone_verified": false,
      "last_order_at": null,
      "total_orders": 0,
      "total_spent": "0.000",
      "average_order_value": "0.000",
      "preferences": null,
      "notes": null,
      "created_at": "2025-10-06T12:29:16.000000Z",
      "updated_at": "2025-10-08T13:28:34.000000Z",
      "latest_order": {
        "id": 2,
        "order_number": "9220645",
        "total_amount": "436.000",
        "status": "paid",
        "created_at": "2025-10-08T13:28:34.000000Z"
      }
    }
  ],
  "message": "Search results retrieved successfully"
}
```

### 7. Get Customer Orders
**GET** `/customers/{id}/orders`

Get all orders for a specific customer with optional filtering.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Customer ID |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by order status |
| `date_from` | date | No | Filter orders from this date |
| `date_to` | date | No | Filter orders to this date |
| `sort_by` | string | No | Sort field (default: `created_at`) |
| `sort_order` | string | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `per_page` | integer | No | Items per page (default: 15) |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/customers/1/orders?status=paid&per_page=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "name": "محمد حامد المحدث",
      "phone": "01062532581",
      "email": null,
      "is_active": true,
      "total_orders": 0,
      "total_spent": "0.000"
    },
    "orders": {
      "current_page": 1,
      "data": [
        {
          "id": 2,
          "order_number": "9220645",
          "total_amount": "436.000",
          "status": "paid",
          "created_at": "2025-10-08T13:28:34.000000Z",
          "order_items": [
            {
              "id": 4,
              "product_id": 9,
              "product_price": "15.500",
              "quantity": 2,
              "product_snapshot": {
                "title": "أحمر شفاه مات طويل الثبات",
                "price": "15.500",
                "currency": "KWD"
              }
            }
          ],
          "payment": {
            "id": 2,
            "provider": "myfatoorah",
            "payment_method": "gp",
            "amount": "436.000",
            "status": "paid"
          }
        }
      ],
      "first_page_url": "http://localhost:8000/api/v1/admin/customers/1/orders?page=1",
      "from": 1,
      "last_page": 1,
      "last_page_url": "http://localhost:8000/api/v1/admin/customers/1/orders?page=1",
      "links": [...],
      "next_page_url": null,
      "path": "http://localhost:8000/api/v1/admin/customers/1/orders",
      "per_page": 15,
      "prev_page_url": null,
      "to": 2,
      "total": 2
    }
  },
  "message": "Customer orders retrieved successfully"
}
```

### 8. Migrate Orders to Customers
**POST** `/customers/migrate-orders`

Migrate existing orders to create customer records.

#### Example Request
```bash
curl -X POST "http://localhost:8000/api/v1/admin/customers/migrate-orders" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "processed": 5,
    "created": 3,
    "updated": 2,
    "errors": 0
  },
  "message": "Migration completed successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email must be a valid email address."]
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
  "message": "Customer not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving customers",
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

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All monetary values are in KWD (Kuwaiti Dinar)
3. Customer addresses are stored as JSON objects
4. The `latest_order` relationship is included in customer listings for quick reference
5. Customer statistics are automatically updated when orders are processed
6. VIP customers are defined as those with total spending >= 500 KWD
7. New customers are those with <= 1 order and created within the last 30 days
8. Active customers are those with orders within the last 90 days
