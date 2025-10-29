# Reports API Documentation

## Overview
This document provides comprehensive documentation for the Reports API endpoints. All endpoints require admin authentication using JWT Bearer token.

**Base URL:** `http://localhost:8000/api/v1/admin`

## Authentication
All endpoints require authentication using JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Sales Report
**GET** `/reports/sales`

Generate comprehensive sales reports with optional grouping and filtering.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | date | Yes | Start date for the report period |
| `end_date` | date | Yes | End date for the report period |
| `format` | string | No | Export format: `json`, `csv`, `xlsx` (default: `json`) |
| `group_by` | string | No | Group data by: `day`, `week`, `month` (default: `day`) |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/reports/sales?start_date=2025-10-01&end_date=2025-10-08&format=json&group_by=day" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_orders": 1,
      "total_revenue": "65.250",
      "average_order_value": "65.2500000",
      "period": {
        "start": "2025-10-01",
        "end": "2025-10-08",
        "group_by": "day"
      }
    },
    "data": [
      {
        "period": "2025-10-06",
        "orders_count": 1,
        "total_revenue": "65.250"
      }
    ]
  },
  "message": "Sales report generated successfully"
}
```

#### CSV Export Response
The CSV export returns a downloadable file with headers:
```
Summary
Total Orders,1
Total Revenue,65.250
Average Order Value,65.2500000

Period,Orders Count,Total Revenue
2025-10-06,1,65.250
```

### 2. Products Report
**GET** `/reports/products`

Generate comprehensive products reports with statistics and filtering.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category_id` | integer | No | Filter by specific category ID |
| `format` | string | No | Export format: `json`, `csv`, `xlsx` (default: `json`) |
| `include_inactive` | boolean | No | Include inactive products (default: false) |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/reports/products?format=json&include_inactive=false" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_products": 11,
      "available_products": 11,
      "unavailable_products": 0,
      "low_stock_products": 11,
      "out_of_stock_products": 11,
      "average_price": 35.47727272727273,
      "total_value": 0
    },
    "products": [
      {
        "id": 1,
        "title": "كريم مرطب للوجه بفيتامين C",
        "slug": "vitamin-c-face-moisturizer",
        "description": "كريم مرطب غني بفيتامين C يساعد على تجديد خلايا البشرة وإشراقها. مناسب لجميع أنواع البشرة ويوفر ترطيباً عميقاً لمدة 24 ساعة.",
        "short_description": "كريم مرطب بفيتامين C للإشراق والترطيب العميق",
        "price": "25.500",
        "currency": "KWD",
        "is_available": true,
        "stock_quantity": 0,
        "category_id": 2,
        "images": [
          "https://picsum.photos/800/800?random=1",
          "https://picsum.photos/800/800?random=2"
        ],
        "meta": {
          "brand": "Soapy Bubbles",
          "size": "50ml",
          "ingredients": ["فيتامين C", "حمض الهيالورونيك", "زيت الأرغان"]
        },
        "created_at": "2025-10-06T08:56:29.000000Z",
        "updated_at": "2025-10-06T15:02:29.000000Z",
        "category": {
          "id": 2,
          "name": "كريمات الوجه",
          "slug": "face-creams",
          "is_active": 1
        }
      }
    ]
  },
  "message": "Products report generated successfully"
}
```

#### CSV Export Response
The CSV export returns a downloadable file with headers:
```
Statistics
Total Products,11
Available Products,11
Average Price,35.47727272727273

ID,Title,Price,Currency,Available,Stock,Category
1,كريم مرطب للوجه بفيتامين C,25.500,KWD,Yes,0,كريمات الوجه
```

### 3. Customers Report
**GET** `/reports/customers`

Generate comprehensive customers reports with statistics and filtering.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | date | No | Filter customers created from this date |
| `end_date` | date | No | Filter customers created to this date |
| `format` | string | No | Export format: `json`, `csv`, `xlsx` (default: `json`) |
| `customer_type` | string | No | Filter by customer type: `all`, `active`, `inactive`, `vip`, `new` (default: `all`) |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/reports/customers?format=json&customer_type=all" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_customers": 1,
      "active_customers": 1,
      "inactive_customers": 0,
      "vip_customers": 0,
      "new_customers": 1,
      "total_spent": 0,
      "average_order_value": 0,
      "customers_with_orders": 0
    },
    "customers": [
      {
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
        "updated_at": "2025-10-08T14:17:59.000000Z",
        "orders": [
          {
            "id": 1,
            "order_number": "5155586",
            "total_amount": "65.250",
            "status": "paid",
            "created_at": "2025-10-06T12:29:16.000000Z"
          },
          {
            "id": 2,
            "order_number": "9220645",
            "total_amount": "436.000",
            "status": "paid",
            "created_at": "2025-10-08T13:28:34.000000Z"
          }
        ]
      }
    ]
  },
  "message": "Customers report generated successfully"
}
```

#### CSV Export Response
The CSV export returns a downloadable file with headers:
```
Statistics
Total Customers,1
Active Customers,1
Total Spent,0

ID,Name,Email,Phone,Total Spent,Orders Count,Active,Created At
1,محمد حامد المحدث,,01062532581,0.000,0,Yes,2025-10-06 12:29:16
```

### 4. Dashboard Report
**GET** `/reports/dashboard`

Generate comprehensive dashboard report with all key metrics.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | date | Yes | Start date for the report period |
| `end_date` | date | Yes | End date for the report period |
| `format` | string | No | Export format: `json`, `csv`, `xlsx` (default: `json`) |

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/admin/reports/dashboard?start_date=2025-10-01&end_date=2025-10-08&format=json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-10-01",
      "end": "2025-10-08"
    },
    "orders": {
      "total": 1,
      "paid": 1,
      "pending": 0,
      "cancelled": 0,
      "total_revenue": 65.25,
      "average_order_value": 65.25
    },
    "products": {
      "total": 11,
      "available": 11,
      "unavailable": 0,
      "low_stock": 11
    },
    "customers": {
      "total": 1,
      "active": 1,
      "new": 1
    },
    "payments": {
      "total": 1,
      "successful": 1,
      "failed": 0,
      "total_amount": 65.25
    }
  },
  "message": "Dashboard report generated successfully"
}
```

#### CSV Export Response
The CSV export returns a downloadable file with headers:
```
Dashboard Report - 2025-10-01 to 2025-10-08

Orders
Total Orders,1
Paid Orders,1
Total Revenue,65.25
Average Order Value,65.25

Products
Total Products,11
Available Products,11
Low Stock Products,11

Customers
Total Customers,1
Active Customers,1
New Customers,1

Payments
Total Payments,1
Successful Payments,1
Total Amount,65.25
```

## Report Types and Definitions

### Sales Report
- **Total Orders**: Count of all paid orders in the period
- **Total Revenue**: Sum of all paid order amounts
- **Average Order Value**: Total revenue divided by total orders
- **Grouping Options**:
  - `day`: Group by individual days
  - `week`: Group by weeks (year and week number)
  - `month`: Group by months (year and month)

### Products Report
- **Total Products**: Count of all products
- **Available Products**: Count of products with `is_available = true`
- **Unavailable Products**: Count of products with `is_available = false`
- **Low Stock Products**: Count of products with `stock_quantity <= 10`
- **Out of Stock Products**: Count of products with `stock_quantity = 0`
- **Average Price**: Average price of all products
- **Total Value**: Sum of (price × stock_quantity) for all products

### Customers Report
- **Total Customers**: Count of all customers
- **Active Customers**: Count of customers with `is_active = true`
- **Inactive Customers**: Count of customers with `is_active = false`
- **VIP Customers**: Count of customers with `total_spent > 1000`
- **New Customers**: Count of customers created within last 30 days
- **Total Spent**: Sum of all customer spending
- **Average Order Value**: Average spending per customer
- **Customers with Orders**: Count of customers who have placed orders

### Dashboard Report
- **Orders Section**: All order-related metrics
- **Products Section**: All product-related metrics
- **Customers Section**: All customer-related metrics
- **Payments Section**: All payment-related metrics

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "start_date": ["The start date field is required."],
    "end_date": ["The end date must be a date after or equal to start date."]
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

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error generating sales report",
  "error": "Database connection failed"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 422 | Validation Error |
| 500 | Internal Server Error |

## Export Formats

### JSON Format
- Default format for all reports
- Returns structured data with statistics and detailed records
- Suitable for API consumption and data processing

### CSV Format
- Comma-separated values format
- Includes summary statistics followed by detailed data
- Suitable for spreadsheet applications and data analysis
- Headers are included for easy identification

### XLSX Format
- Excel spreadsheet format
- Currently returns JSON with message indicating XLSX not implemented
- Future enhancement for advanced spreadsheet features

## Data Filtering and Sorting

### Date Filtering
- All reports support date range filtering
- Dates should be in `YYYY-MM-DD` format
- End date must be after or equal to start date

### Category Filtering (Products Report)
- Filter products by specific category ID
- Only affects products data, not statistics

### Customer Type Filtering (Customers Report)
- `all`: All customers (default)
- `active`: Only active customers
- `inactive`: Only inactive customers
- `vip`: Only VIP customers (spent > 1000)
- `new`: Only new customers (created within last 30 days)

### Include Inactive Products (Products Report)
- Default: `false` (exclude inactive products)
- Set to `true` to include inactive products in the report

## Performance Considerations

1. **Large Date Ranges**: Reports with very large date ranges may take longer to generate
2. **Product Images**: Product reports include image URLs which may increase response size
3. **Customer Orders**: Customer reports include order history which may be large for customers with many orders
4. **Export Formats**: CSV exports are streamed to prevent memory issues with large datasets

## Notes

1. All monetary values are in KWD (Kuwaiti Dinar)
2. All timestamps are in ISO 8601 format (UTC)
3. Reports only include paid orders for revenue calculations
4. VIP customer threshold is set to 1000 KWD
5. New customer threshold is 30 days from creation date
6. Low stock threshold is 10 units
7. CSV exports are streamed for better performance with large datasets
8. XLSX export functionality requires additional PHP packages (not currently implemented)
