https://api.soapy-bubbles.com/api/v1/reports/dashboard/overview?date_from=2025-09-14&date_to=2025-10-14

 respose:
 {
    "success": true,
    "data": {
        "total_products": 1,
        "active_products": 1,
        "low_stock_products": 1,
        "out_of_stock_products": 1,
        "total_customers": 3,
        "active_customers": 3,
        "new_customers": 3,
        "total_orders": 24,
        "pending_orders": 2,
        "completed_orders": 0,
        "cancelled_orders": 1,
        "total_revenue": "616.000",
        "period_revenue": "616.000",
        "average_order_value": "30.8000000"
    }
}

----------------------
https://api.soapy-bubbles.com/api/v1/reports/dashboard/business-intelligence?date_from=2025-09-14&date_to=2025-10-14


response:
{
    "success": true,
    "data": {
        "kpis": {
            "conversion_rate": 800,
            "customer_lifetime_value": 0,
            "average_order_value": "30.8000000",
            "repeat_customer_rate": 66.66666666666666,
            "cart_abandonment_rate": 4.166666666666666
        },
        "growth_metrics": {
            "revenue_growth": 0,
            "current_period_revenue": "616.000",
            "previous_period_revenue": 0
        },
        "seasonal_trends": [
            {
                "month": 10,
                "revenue": "616.000",
                "orders": 20
            }
        ]
    }
}

------------------------
https://api.soapy-bubbles.com/api/v1/reports/analytics/sales?date_from=2025-09-14&date_to=2025-10-14&period=day


response:
{
    "success": true,
    "data": {
        "sales_over_time": [
            {
                "period": "2025-10-10",
                "total": "360.000",
                "orders": 10
            },
            {
                "period": "2025-10-11",
                "total": "256.000",
                "orders": 10
            }
        ],
        "top_products": [
            {
                "id": 1,
                "title": "\u0628\u0644\u0633\u0645 \u0627\u0644\u0634\u064a\u0627 \u0648\u0627\u0644\u0644\u0648\u0632",
                "price": "8.000",
                "total_sold": "77",
                "total_revenue": "616.000"
            }
        ],
        "sales_by_category": [
            {
                "name": "\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0641\u0631\u062f\u064a\u0647",
                "total_revenue": "616.000",
                "total_quantity": "77"
            }
        ],
        "payment_methods": [
            {
                "method": "",
                "count": 20,
                "total_amount": 616
            }
        ]
    }
}


--------------------
https://api.soapy-bubbles.com/api/v1/reports/analytics/customers?date_from=2025-09-14&date_to=2025-10-14


response:
{
    "success": true,
    "data": {
        "customer_acquisition": [
            {
                "date": "2025-10-10",
                "count": 1
            },
            {
                "date": "2025-10-11",
                "count": 2
            }
        ],
        "top_customers_by_orders": [
            {
                "id": 1,
                "name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                "phone": "01062532581",
                "email": "mmop9909@gmail.com",
                "address": {
                    "city": "\u0645\u0634\u0631\u0641",
                    "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
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
                "created_at": "2025-10-10T21:07:04.000000Z",
                "updated_at": "2025-10-11T19:14:42.000000Z",
                "orders_count": 21
            },
            {
                "id": 5,
                "name": "mohamed hamed",
                "phone": "01064963970",
                "email": null,
                "address": {
                    "city": "\u0627\u0644\u0623\u0646\u062f\u0644\u0633",
                    "street": "personal",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u0627\u0644\u0641\u0631\u0648\u0627\u0646\u064a\u0629",
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
                "created_at": "2025-10-11T22:04:55.000000Z",
                "updated_at": "2025-10-11T22:14:46.000000Z",
                "orders_count": 2
            },
            {
                "id": 3,
                "name": "hjhj",
                "phone": "6776467478758",
                "email": null,
                "address": {
                    "city": "\u062d\u0648\u0644\u064a",
                    "street": "hjvb",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
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
                "created_at": "2025-10-11T22:03:47.000000Z",
                "updated_at": "2025-10-11T22:03:47.000000Z",
                "orders_count": 1
            }
        ],
        "top_customers_by_revenue": [
            {
                "id": 1,
                "name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                "email": "mmop9909@gmail.com",
                "phone": "01062532581",
                "total_spent": "560.000"
            },
            {
                "id": 5,
                "name": "mohamed hamed",
                "email": null,
                "phone": "01064963970",
                "total_spent": "56.000"
            }
        ],
        "customers_by_city": [
            {
                "city": "\u0645\u0634\u0631\u0641",
                "count": 1
            },
            {
                "city": "\u062d\u0648\u0644\u064a",
                "count": 1
            },
            {
                "city": "\u0627\u0644\u0623\u0646\u062f\u0644\u0633",
                "count": 1
            }
        ]
    }
}

--------------------------
https://api.soapy-bubbles.com/api/v1/reports/analytics/products?date_from=2025-09-14&date_to=2025-10-14


response:
{
    "success": true,
    "data": {
        "product_performance": [
            {
                "id": 1,
                "title": "\u0628\u0644\u0633\u0645 \u0627\u0644\u0634\u064a\u0627 \u0648\u0627\u0644\u0644\u0648\u0632",
                "price": "8.000",
                "slug": "blsm-alshya-oalloz",
                "description": "\u0628\u0644\u0633\u0645 \u0645\u063a\u0630\u064a \u0628\u062a\u0631\u0643\u064a\u0628\u0629 \u063a\u0646\u064a\u0629 \u0628\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0637\u0628\u064a\u0639\u064a\u0629 \u0648\u0627\u0644\u0641\u064a\u062a\u0627\u0645\u064a\u0646\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u0639\u0645\u0644 \u0639\u0644\u0649 \u062a\u0631\u0637\u064a\u0628 \u0627\u0644\u0634\u0639\u0631 \u0648\u062a\u0642\u0648\u064a\u062a\u0647 \u0645\u0646 \u0627\u0644\u062c\u0630\u0648\u0631 \u062d\u062a\u0649 \u0627\u0644\u0623\u0637\u0631\u0627\u0641.\u064a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 :\u0632\u064a\u062a \u0627\u0644\u0644\u0648\u0632: \u064a\u063a\u0630\u064a \u0627\u0644\u0634\u0639\u0631 \u0648\u064a\u0631\u0637\u0628\u0647 \u0628\u0639\u0645\u0642\u060c \u0645\u0645\u0627 \u064a\u062c\u0639\u0644\u0647 \u0623\u0643\u062b\u0631 \u0646\u0639\u0648\u0645\u0629 \u0648\u0644\u0645\u0639\u0627\u0646\u064b\u0627. \u2022 \u0632\u0628\u062f\u0629 \u0627\u0644\u0634\u064a\u0627: \u062a\u0645\u0646\u062d \u062a\u0631\u0637\u064a\u0628\u064b\u0627 \u0645\u0643\u062b\u0641\u064b\u0627 \u0648\u062a\u062d\u0645\u064a \u0627\u0644\u0634\u0639\u0631 \u0645\u0646 \u0627\u0644\u062c\u0641\u0627\u0641 \u0648\u0627\u0644\u062a\u0644\u0641. \u2022 \u0641\u064a\u062a\u0627\u0645\u064a\u0646 E: \u0645\u0636\u0627\u062f \u0623\u0643\u0633\u062f\u0629 \u0642\u0648\u064a \u064a\u062d\u0645\u064a \u0627\u0644\u0634\u0639\u0631 \u0645\u0646 \u0627\u0644\u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u0628\u064a\u0626\u064a\u0629 \u0627\u0644\u0636\u0627\u0631\u0629 \u0648\u064a\u0645\u0646\u0639 \u0627\u0644\u062a\u0642\u0635\u0641. \u2022 \u0641\u064a\u062a\u0627\u0645\u064a\u0646 B5 (\u0628\u0627\u0646\u062b\u064a\u0646\u0648\u0644): \u064a\u0633\u0627\u0639\u062f \u0639\u0644\u0649 \u062a\u0642\u0648\u064a\u0629 \u0627\u0644\u0634\u0639\u0631\u060c \u062a\u062d\u0633\u064a\u0646 \u0645\u0631\u0648\u0646\u062a\u0647\u060c \u0648\u0632\u064a\u0627\u062f\u0629 \u0644\u0645\u0639\u0627\u0646\u0647 \u0627\u0644\u0637\u0628\u064a\u0639\u064a\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645: \u0628\u0639\u062f \u063a\u0633\u0644 \u0627\u0644\u0634\u0639\u0631 \u0628\u0627\u0644\u0634\u0627\u0645\u0628\u0648\u060c \u0636\u0639\u064a \u0643\u0645\u064a\u0629 \u0645\u0646\u0627\u0633\u0628\u0629 \u0645\u0646 \u0627\u0644\u0628\u0644\u0633\u0645 \u0639\u0644\u0649 \u0627\u0644\u0634\u0639\u0631 \u0627\u0644\u0631\u0637\u0628\u060c \u0645\u0639 \u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u0639\u0644\u0649 \u0627\u0644\u0623\u0637\u0631\u0627\u0641. \u0627\u062a\u0631\u0643\u064a\u0647 \u0644\u0645\u062f\u0629 3-5 \u062f\u0642\u0627\u0626\u0642\u060c \u062b\u0645 \u0627\u0634\u0637\u0641\u064a\u0647 \u062c\u064a\u062f\u064b\u0627 \u0628\u0627\u0644\u0645\u0627\u0621 \u0627\u0644\u062f\u0627\u0641\u0626.",
                "stock_quantity": 0,
                "category_id": 2,
                "created_at": "2025-10-10T20:04:41.000000Z",
                "updated_at": "2025-10-11T21:10:31.000000Z",
                "total_sold": "86",
                "total_revenue": "688.000"
            }
        ],
        "low_stock_products": [],
        "out_of_stock_products": [
            {
                "id": 1,
                "title": "\u0628\u0644\u0633\u0645 \u0627\u0644\u0634\u064a\u0627 \u0648\u0627\u0644\u0644\u0648\u0632",
                "slug": "blsm-alshya-oalloz",
                "description": "\u0628\u0644\u0633\u0645 \u0645\u063a\u0630\u064a \u0628\u062a\u0631\u0643\u064a\u0628\u0629 \u063a\u0646\u064a\u0629 \u0628\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0637\u0628\u064a\u0639\u064a\u0629 \u0648\u0627\u0644\u0641\u064a\u062a\u0627\u0645\u064a\u0646\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u0639\u0645\u0644 \u0639\u0644\u0649 \u062a\u0631\u0637\u064a\u0628 \u0627\u0644\u0634\u0639\u0631 \u0648\u062a\u0642\u0648\u064a\u062a\u0647 \u0645\u0646 \u0627\u0644\u062c\u0630\u0648\u0631 \u062d\u062a\u0649 \u0627\u0644\u0623\u0637\u0631\u0627\u0641.\u064a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 :\u0632\u064a\u062a \u0627\u0644\u0644\u0648\u0632: \u064a\u063a\u0630\u064a \u0627\u0644\u0634\u0639\u0631 \u0648\u064a\u0631\u0637\u0628\u0647 \u0628\u0639\u0645\u0642\u060c \u0645\u0645\u0627 \u064a\u062c\u0639\u0644\u0647 \u0623\u0643\u062b\u0631 \u0646\u0639\u0648\u0645\u0629 \u0648\u0644\u0645\u0639\u0627\u0646\u064b\u0627. \u2022 \u0632\u0628\u062f\u0629 \u0627\u0644\u0634\u064a\u0627: \u062a\u0645\u0646\u062d \u062a\u0631\u0637\u064a\u0628\u064b\u0627 \u0645\u0643\u062b\u0641\u064b\u0627 \u0648\u062a\u062d\u0645\u064a \u0627\u0644\u0634\u0639\u0631 \u0645\u0646 \u0627\u0644\u062c\u0641\u0627\u0641 \u0648\u0627\u0644\u062a\u0644\u0641. \u2022 \u0641\u064a\u062a\u0627\u0645\u064a\u0646 E: \u0645\u0636\u0627\u062f \u0623\u0643\u0633\u062f\u0629 \u0642\u0648\u064a \u064a\u062d\u0645\u064a \u0627\u0644\u0634\u0639\u0631 \u0645\u0646 \u0627\u0644\u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u0628\u064a\u0626\u064a\u0629 \u0627\u0644\u0636\u0627\u0631\u0629 \u0648\u064a\u0645\u0646\u0639 \u0627\u0644\u062a\u0642\u0635\u0641. \u2022 \u0641\u064a\u062a\u0627\u0645\u064a\u0646 B5 (\u0628\u0627\u0646\u062b\u064a\u0646\u0648\u0644): \u064a\u0633\u0627\u0639\u062f \u0639\u0644\u0649 \u062a\u0642\u0648\u064a\u0629 \u0627\u0644\u0634\u0639\u0631\u060c \u062a\u062d\u0633\u064a\u0646 \u0645\u0631\u0648\u0646\u062a\u0647\u060c \u0648\u0632\u064a\u0627\u062f\u0629 \u0644\u0645\u0639\u0627\u0646\u0647 \u0627\u0644\u0637\u0628\u064a\u0639\u064a\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645: \u0628\u0639\u062f \u063a\u0633\u0644 \u0627\u0644\u0634\u0639\u0631 \u0628\u0627\u0644\u0634\u0627\u0645\u0628\u0648\u060c \u0636\u0639\u064a \u0643\u0645\u064a\u0629 \u0645\u0646\u0627\u0633\u0628\u0629 \u0645\u0646 \u0627\u0644\u0628\u0644\u0633\u0645 \u0639\u0644\u0649 \u0627\u0644\u0634\u0639\u0631 \u0627\u0644\u0631\u0637\u0628\u060c \u0645\u0639 \u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u0639\u0644\u0649 \u0627\u0644\u0623\u0637\u0631\u0627\u0641. \u0627\u062a\u0631\u0643\u064a\u0647 \u0644\u0645\u062f\u0629 3-5 \u062f\u0642\u0627\u0626\u0642\u060c \u062b\u0645 \u0627\u0634\u0637\u0641\u064a\u0647 \u062c\u064a\u062f\u064b\u0627 \u0628\u0627\u0644\u0645\u0627\u0621 \u0627\u0644\u062f\u0627\u0641\u0626.",
                "short_description": "\u0628\u0644\u0633\u0645 \u0627\u0644\u0634\u064a\u0627 \u0648\u0627\u0644\u0644\u0648\u0632",
                "price": "8.000",
                "currency": "KWD",
                "is_available": true,
                "stock_quantity": 0,
                "category_id": 2,
                "images": [
                    "https:\/\/api.soapy-bubbles.com\/storage\/images\/products\/1760125968_IySdCjaqOL.JPG"
                ],
                "meta": {
                    "weight": null,
                    "skin_type": null,
                    "dimensions": null,
                    "ingredients": null
                },
                "created_at": "2025-10-10T20:04:41.000000Z",
                "updated_at": "2025-10-11T21:10:31.000000Z"
            }
        ],
        "products_by_category": [
            {
                "id": 2,
                "name": "\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0641\u0631\u062f\u064a\u0647",
                "description": "\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0641\u0631\u062f\u064a\u0647",
                "is_active": 1,
                "sort_order": 1,
                "meta_title": null,
                "meta_description": null,
                "image": "https:\/\/cdn.ready-market.com.tw\/45718261\/Templates\/pic\/category_image-soap.jpg?v=f6ffb5e2",
                "slug": "almntgat-alfrdyh",
                "parent_id": null,
                "created_at": "2025-10-10T18:30:53.000000Z",
                "updated_at": "2025-10-10T18:30:53.000000Z",
                "products_count": 1
            },
            {
                "id": 1,
                "name": "\u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0627\u062a",
                "description": "\u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0627\u062a",
                "is_active": 1,
                "sort_order": 0,
                "meta_title": null,
                "meta_description": null,
                "image": "https:\/\/www.ksecret.com\/images\/thumbs\/0001853_some-by-mi-30-days-miracle-starter-kit-soap-toner-serum-cream_750.jpeg",
                "slug": "almgmoaaat",
                "parent_id": null,
                "created_at": "2025-10-10T18:22:04.000000Z",
                "updated_at": "2025-10-10T18:22:04.000000Z",
                "products_count": 0
            }
        ]
    }
}

-----------------------
https://api.soapy-bubbles.com/api/v1/reports/analytics/orders?date_from=2025-09-14&date_to=2025-10-14


response:
{
    "success": true,
    "data": {
        "orders_by_status": [
            {
                "status": "shipped",
                "count": 3
            },
            {
                "status": "paid",
                "count": 16
            },
            {
                "status": "pending",
                "count": 2
            },
            {
                "status": "cancelled",
                "count": 1
            },
            {
                "status": "awaiting_payment",
                "count": 2
            }
        ],
        "orders_by_payment_status": [
            {
                "payment_status": "paid",
                "count": 20
            },
            {
                "payment_status": null,
                "count": 2
            },
            {
                "payment_status": "initiated",
                "count": 2
            }
        ],
        "average_processing_time_hours": 0,
        "orders_over_time": [
            {
                "date": "2025-10-10",
                "count": 12,
                "total_amount": "411.000"
            },
            {
                "date": "2025-10-11",
                "count": 12,
                "total_amount": "328.000"
            }
        ],
        "recent_orders": [
            {
                "id": 24,
                "customer_id": 5,
                "order_number": "1356359",
                "customer_name": "mohamed hamed",
                "customer_phone": "01064963970",
                "customer_email": null,
                "shipping_address": {
                    "city": "\u0627\u0644\u0623\u0646\u062f\u0644\u0633",
                    "street": "personal",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u0627\u0644\u0641\u0631\u0648\u0627\u0646\u064a\u0629",
                    "postal_code": null
                },
                "total_amount": "56.000",
                "currency": "KWD",
                "status": "paid",
                "tracking_number": "TRK-55E59387",
                "shipping_date": null,
                "delivery_date": null,
                "payment_id": 22,
                "notes": null,
                "discount_code": null,
                "discount_amount": "0.000",
                "subtotal_amount": "56.000",
                "shipping_amount": "0.000",
                "free_shipping": false,
                "admin_notes": null,
                "created_at": "2025-10-11T22:14:46.000000Z",
                "updated_at": "2025-10-11T22:15:22.000000Z",
                "customer": {
                    "id": 5,
                    "name": "mohamed hamed",
                    "phone": "01064963970",
                    "email": null,
                    "address": {
                        "city": "\u0627\u0644\u0623\u0646\u062f\u0644\u0633",
                        "street": "personal",
                        "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u0627\u0644\u0641\u0631\u0648\u0627\u0646\u064a\u0629",
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
                    "created_at": "2025-10-11T22:04:55.000000Z",
                    "updated_at": "2025-10-11T22:14:46.000000Z"
                }
            },
            {
                "id": 23,
                "customer_id": 5,
                "order_number": "6178343",
                "customer_name": "mohamed hamed",
                "customer_phone": "01064963970",
                "customer_email": null,
                "shipping_address": {
                    "city": "\u0627\u0644\u0623\u0646\u062f\u0644\u0633",
                    "street": "personal",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u0627\u0644\u0641\u0631\u0648\u0627\u0646\u064a\u0629",
                    "postal_code": null
                },
                "total_amount": "56.000",
                "currency": "KWD",
                "status": "awaiting_payment",
                "tracking_number": "TRK-C9DED53A",
                "shipping_date": null,
                "delivery_date": null,
                "payment_id": 21,
                "notes": null,
                "discount_code": null,
                "discount_amount": "0.000",
                "subtotal_amount": "56.000",
                "shipping_amount": "0.000",
                "free_shipping": false,
                "admin_notes": null,
                "created_at": "2025-10-11T22:04:55.000000Z",
                "updated_at": "2025-10-11T22:05:00.000000Z",
                "customer": {
                    "id": 5,
                    "name": "mohamed hamed",
                    "phone": "01064963970",
                    "email": null,
                    "address": {
                        "city": "\u0627\u0644\u0623\u0646\u062f\u0644\u0633",
                        "street": "personal",
                        "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u0627\u0644\u0641\u0631\u0648\u0627\u0646\u064a\u0629",
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
                    "created_at": "2025-10-11T22:04:55.000000Z",
                    "updated_at": "2025-10-11T22:14:46.000000Z"
                }
            },
            {
                "id": 22,
                "customer_id": 3,
                "order_number": "7448492",
                "customer_name": "hjhj",
                "customer_phone": "6776467478758",
                "customer_email": null,
                "shipping_address": {
                    "city": "\u062d\u0648\u0644\u064a",
                    "street": "hjvb",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
                    "postal_code": null
                },
                "total_amount": "16.000",
                "currency": "KWD",
                "status": "awaiting_payment",
                "tracking_number": "TRK-3F714BA2",
                "shipping_date": null,
                "delivery_date": null,
                "payment_id": 20,
                "notes": null,
                "discount_code": null,
                "discount_amount": "0.000",
                "subtotal_amount": "16.000",
                "shipping_amount": "0.000",
                "free_shipping": false,
                "admin_notes": null,
                "created_at": "2025-10-11T22:03:47.000000Z",
                "updated_at": "2025-10-11T22:03:53.000000Z",
                "customer": {
                    "id": 3,
                    "name": "hjhj",
                    "phone": "6776467478758",
                    "email": null,
                    "address": {
                        "city": "\u062d\u0648\u0644\u064a",
                        "street": "hjvb",
                        "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
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
                    "created_at": "2025-10-11T22:03:47.000000Z",
                    "updated_at": "2025-10-11T22:03:47.000000Z"
                }
            },
            {
                "id": 21,
                "customer_id": 1,
                "order_number": "1137166",
                "customer_name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                "customer_phone": "01062532581",
                "customer_email": null,
                "shipping_address": {
                    "city": "\u0645\u0634\u0631\u0641",
                    "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
                    "postal_code": null
                },
                "total_amount": "8.000",
                "currency": "KWD",
                "status": "cancelled",
                "tracking_number": "TRK-ACD5E5D3",
                "shipping_date": null,
                "delivery_date": null,
                "payment_id": 19,
                "notes": null,
                "discount_code": null,
                "discount_amount": "0.000",
                "subtotal_amount": "8.000",
                "shipping_amount": "0.000",
                "free_shipping": false,
                "admin_notes": null,
                "created_at": "2025-10-11T19:14:42.000000Z",
                "updated_at": "2025-10-11T21:11:25.000000Z",
                "customer": {
                    "id": 1,
                    "name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                    "phone": "01062532581",
                    "email": "mmop9909@gmail.com",
                    "address": {
                        "city": "\u0645\u0634\u0631\u0641",
                        "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                        "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
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
                    "created_at": "2025-10-10T21:07:04.000000Z",
                    "updated_at": "2025-10-11T19:14:42.000000Z"
                }
            },
            {
                "id": 20,
                "customer_id": 1,
                "order_number": "9379427",
                "customer_name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                "customer_phone": "01062532581",
                "customer_email": "mmop9909@gmail.com",
                "shipping_address": {
                    "city": "\u0645\u0634\u0631\u0641",
                    "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
                    "postal_code": null
                },
                "total_amount": "24.000",
                "currency": "KWD",
                "status": "shipped",
                "tracking_number": "TRK-A8C094F9",
                "shipping_date": null,
                "delivery_date": null,
                "payment_id": 18,
                "notes": null,
                "discount_code": null,
                "discount_amount": "0.000",
                "subtotal_amount": "24.000",
                "shipping_amount": "0.000",
                "free_shipping": false,
                "admin_notes": null,
                "created_at": "2025-10-11T19:12:34.000000Z",
                "updated_at": "2025-10-11T21:59:59.000000Z",
                "customer": {
                    "id": 1,
                    "name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                    "phone": "01062532581",
                    "email": "mmop9909@gmail.com",
                    "address": {
                        "city": "\u0645\u0634\u0631\u0641",
                        "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                        "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
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
                    "created_at": "2025-10-10T21:07:04.000000Z",
                    "updated_at": "2025-10-11T19:14:42.000000Z"
                }
            },
            {
                "id": 19,
                "customer_id": 1,
                "order_number": "2542964",
                "customer_name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                "customer_phone": "01062532581",
                "customer_email": "mmop9909@gmail.com",
                "shipping_address": {
                    "city": "\u0645\u0634\u0631\u0641",
                    "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
                    "postal_code": null
                },
                "total_amount": "16.000",
                "currency": "KWD",
                "status": "paid",
                "tracking_number": "TRK-16A89BA3",
                "shipping_date": null,
                "delivery_date": null,
                "payment_id": 17,
                "notes": null,
                "discount_code": null,
                "discount_amount": "0.000",
                "subtotal_amount": "16.000",
                "shipping_amount": "0.000",
                "free_shipping": false,
                "admin_notes": null,
                "created_at": "2025-10-11T19:10:22.000000Z",
                "updated_at": "2025-10-11T19:11:15.000000Z",
                "customer": {
                    "id": 1,
                    "name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                    "phone": "01062532581",
                    "email": "mmop9909@gmail.com",
                    "address": {
                        "city": "\u0645\u0634\u0631\u0641",
                        "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                        "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
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
                    "created_at": "2025-10-10T21:07:04.000000Z",
                    "updated_at": "2025-10-11T19:14:42.000000Z"
                }
            },
            {
                "id": 18,
                "customer_id": 1,
                "order_number": "8392673",
                "customer_name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                "customer_phone": "01062532581",
                "customer_email": null,
                "shipping_address": {
                    "city": "\u0645\u0634\u0631\u0641",
                    "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
                    "postal_code": null
                },
                "total_amount": "32.000",
                "currency": "KWD",
                "status": "paid",
                "tracking_number": "TRK-B8B86143",
                "shipping_date": null,
                "delivery_date": null,
                "payment_id": 16,
                "notes": null,
                "discount_code": null,
                "discount_amount": "0.000",
                "subtotal_amount": "32.000",
                "shipping_amount": "0.000",
                "free_shipping": false,
                "admin_notes": null,
                "created_at": "2025-10-11T18:54:42.000000Z",
                "updated_at": "2025-10-11T18:55:20.000000Z",
                "customer": {
                    "id": 1,
                    "name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                    "phone": "01062532581",
                    "email": "mmop9909@gmail.com",
                    "address": {
                        "city": "\u0645\u0634\u0631\u0641",
                        "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                        "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
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
                    "created_at": "2025-10-10T21:07:04.000000Z",
                    "updated_at": "2025-10-11T19:14:42.000000Z"
                }
            },
            {
                "id": 17,
                "customer_id": 1,
                "order_number": "8125818",
                "customer_name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                "customer_phone": "01062532581",
                "customer_email": null,
                "shipping_address": {
                    "city": "\u0645\u0634\u0631\u0641",
                    "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
                    "postal_code": null
                },
                "total_amount": "16.000",
                "currency": "KWD",
                "status": "paid",
                "tracking_number": "TRK-F06F5250",
                "shipping_date": null,
                "delivery_date": null,
                "payment_id": 15,
                "notes": null,
                "discount_code": null,
                "discount_amount": "0.000",
                "subtotal_amount": "16.000",
                "shipping_amount": "0.000",
                "free_shipping": false,
                "admin_notes": null,
                "created_at": "2025-10-11T18:39:07.000000Z",
                "updated_at": "2025-10-11T18:40:17.000000Z",
                "customer": {
                    "id": 1,
                    "name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                    "phone": "01062532581",
                    "email": "mmop9909@gmail.com",
                    "address": {
                        "city": "\u0645\u0634\u0631\u0641",
                        "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                        "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
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
                    "created_at": "2025-10-10T21:07:04.000000Z",
                    "updated_at": "2025-10-11T19:14:42.000000Z"
                }
            },
            {
                "id": 16,
                "customer_id": 1,
                "order_number": "3492404",
                "customer_name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                "customer_phone": "01062532581",
                "customer_email": null,
                "shipping_address": {
                    "city": "\u0645\u0634\u0631\u0641",
                    "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
                    "postal_code": null
                },
                "total_amount": "32.000",
                "currency": "KWD",
                "status": "paid",
                "tracking_number": "TRK-68189C02",
                "shipping_date": null,
                "delivery_date": null,
                "payment_id": 14,
                "notes": null,
                "discount_code": null,
                "discount_amount": "0.000",
                "subtotal_amount": "32.000",
                "shipping_amount": "0.000",
                "free_shipping": false,
                "admin_notes": null,
                "created_at": "2025-10-11T18:32:11.000000Z",
                "updated_at": "2025-10-11T18:32:43.000000Z",
                "customer": {
                    "id": 1,
                    "name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                    "phone": "01062532581",
                    "email": "mmop9909@gmail.com",
                    "address": {
                        "city": "\u0645\u0634\u0631\u0641",
                        "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                        "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
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
                    "created_at": "2025-10-10T21:07:04.000000Z",
                    "updated_at": "2025-10-11T19:14:42.000000Z"
                }
            },
            {
                "id": 15,
                "customer_id": 1,
                "order_number": "9708180",
                "customer_name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                "customer_phone": "01062532581",
                "customer_email": null,
                "shipping_address": {
                    "city": "\u0645\u0634\u0631\u0641",
                    "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                    "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
                    "postal_code": null
                },
                "total_amount": "24.000",
                "currency": "KWD",
                "status": "paid",
                "tracking_number": "TRK-0B8518A3",
                "shipping_date": null,
                "delivery_date": null,
                "payment_id": 13,
                "notes": null,
                "discount_code": null,
                "discount_amount": "0.000",
                "subtotal_amount": "24.000",
                "shipping_amount": "0.000",
                "free_shipping": false,
                "admin_notes": null,
                "created_at": "2025-10-11T18:27:45.000000Z",
                "updated_at": "2025-10-11T18:28:26.000000Z",
                "customer": {
                    "id": 1,
                    "name": "\u0645\u062d\u0645\u062f \u062d\u0627\u0645\u062f",
                    "phone": "01062532581",
                    "email": "mmop9909@gmail.com",
                    "address": {
                        "city": "\u0645\u0634\u0631\u0641",
                        "street": "\u0634\u0627\u0631\u0639 \u0627\u064427",
                        "governorate": "\u0645\u062d\u0627\u0641\u0638\u0629 \u062d\u0648\u0644\u064a",
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
                    "created_at": "2025-10-10T21:07:04.000000Z",
                    "updated_at": "2025-10-11T19:14:42.000000Z"
                }
            }
        ]
    }
}

------------------
https://api.soapy-bubbles.com/api/v1/reports/financial/overview?date_from=2025-09-14&date_to=2025-10-14


response:
{
    "success": true,
    "data": {
        "revenue_breakdown": {
            "total_subtotal": "616.000",
            "total_tax": 0,
            "total_shipping": "0.000",
            "total_discount": "0.000",
            "total_revenue": "616.000",
            "total_orders": 20
        },
        "monthly_revenue": [
            {
                "year": 2025,
                "month": 10,
                "revenue": "616.000",
                "orders_count": 20
            }
        ],
        "refunds_and_cancellations": {
            "cancelled_orders": 1,
            "cancelled_revenue": "8.000",
            "refunded_orders": 0,
            "refunded_amount": 0
        }
    }
}
