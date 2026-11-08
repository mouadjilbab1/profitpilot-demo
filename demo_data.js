// ProfitPilot AI — Standalone Live Demo Interceptor (GitHub Pages & Showcase Mode)
(function() {
    const DEMO_STORE = {
        id: 1,
        name: "متجر الأطلس للتجارة",
        currency: "MAD",
        warehouse_city: "الدار البيضاء (Casablanca)",
        bank_name: "CIH Bank",
        rib: "230780001234567890123456",
        phone: "+212 600-112233"
    };

    const RAW_MOCK_DATA = {
  "/api/v1/auth/me": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNiIsImV4cCI6MTc5NDc0NTE5Mn0.jH-7LQ6MDYEpTN8IvHtpnkS7RFgakqkBYuRM1Wn6OtQ",
    "token_type": "bearer",
    "user": {
      "email": "demo@profitpilot.ai",
      "full_name": "كريم العلمي (Karim Alami)",
      "id": 16,
      "is_active": true,
      "created_at": "2026-10-21T16:53:31.562820"
    },
    "active_store": {
      "id": 16,
      "name": "متجر الأطلس للتجارة الدولية",
      "currency": "MAD",
      "country": "Morocco",
      "timezone": "Africa/Casablanca",
      "role": "owner"
    },
    "stores": [
      {
        "id": 16,
        "name": "متجر الأطلس للتجارة الدولية",
        "currency": "MAD",
        "country": "Morocco",
        "timezone": "Africa/Casablanca",
        "role": "owner"
      },
      {
        "id": 17,
        "name": "Atlas Deals — متجر الأطلس",
        "currency": "MAD",
        "country": "Morocco",
        "timezone": "Africa/Casablanca",
        "role": "owner"
      }
    ]
  },
  "/api/v1/dashboard/summary": {
    "currency": "MAD",
    "period_start": "All Time",
    "period_end": "Today",
    "total_orders": 21,
    "delivered_orders": 13,
    "returned_orders": 2,
    "cancelled_orders": 0,
    "pending_orders": 6,
    "delivery_success_rate": "86.67",
    "return_rate": "13.33",
    "gross_sales": "4926.00",
    "delivered_revenue": "3035.00",
    "cogs_total": "784.00",
    "delivery_expenses": "482.00",
    "return_expenses": "42.00",
    "packaging_expenses": "83.00",
    "ad_spend_total": "470.00",
    "other_expenses": "740.00",
    "gross_profit": "2251.00",
    "net_profit": "434.00",
    "net_profit_margin_pct": "14.30",
    "average_order_value": "233.46",
    "expected_cod_receivables": "4478.00",
    "collected_cod_in_hand": "3035.00",
    "settled_cod": "597.00",
    "outstanding_carrier_balance": "2438.00",
    "inventory_valuation": "9199.00"
  },
  "/api/v1/dashboard/charts": {
    "points": [
      {
        "date": "2026-10-11",
        "orders_count": 1,
        "delivered_revenue": "0.00",
        "net_profit": "0.00",
        "return_loss": "0.00",
        "ad_spend": "0.00"
      },
      {
        "date": "2026-10-12",
        "orders_count": 1,
        "delivered_revenue": "0.00",
        "net_profit": "0.00",
        "return_loss": "0.00",
        "ad_spend": "0.00"
      },
      {
        "date": "2026-10-13",
        "orders_count": 3,
        "delivered_revenue": "647.00",
        "net_profit": "342.00",
        "return_loss": "0.00",
        "ad_spend": "0.00"
      },
      {
        "date": "2026-10-14",
        "orders_count": 2,
        "delivered_revenue": "498.00",
        "net_profit": "231.00",
        "return_loss": "0.00",
        "ad_spend": "0.00"
      },
      {
        "date": "2026-10-15",
        "orders_count": 2,
        "delivered_revenue": "498.00",
        "net_profit": "227.00",
        "return_loss": "0.00",
        "ad_spend": "0.00"
      },
      {
        "date": "2026-10-16",
        "orders_count": 2,
        "delivered_revenue": "547.00",
        "net_profit": "279.00",
        "return_loss": "0.00",
        "ad_spend": "0.00"
      },
      {
        "date": "2026-10-17",
        "orders_count": 2,
        "delivered_revenue": "198.00",
        "net_profit": "17.00",
        "return_loss": "0.00",
        "ad_spend": "0.00"
      },
      {
        "date": "2026-10-18",
        "orders_count": 2,
        "delivered_revenue": "149.00",
        "net_profit": "24.00",
        "return_loss": "25.00",
        "ad_spend": "0.00"
      },
      {
        "date": "2026-10-19",
        "orders_count": 2,
        "delivered_revenue": "299.00",
        "net_profit": "116.00",
        "return_loss": "28.00",
        "ad_spend": "0.00"
      },
      {
        "date": "2026-10-20",
        "orders_count": 1,
        "delivered_revenue": "199.00",
        "net_profit": "83.00",
        "return_loss": "0.00",
        "ad_spend": "470.00"
      },
      {
        "date": "2026-10-21",
        "orders_count": 3,
        "delivered_revenue": "0.00",
        "net_profit": "0.00",
        "return_loss": "0.00",
        "ad_spend": "0.00"
      }
    ]
  },
  "/api/v1/dashboard/alerts": [
    {
      "id": "1",
      "severity": "high",
      "type": "cod_unsettled",
      "title": "مستحقات دفع عند الاستلام معلقة لدى شركات الشحن",
      "message": "توجد مبالغ محصلة بقيمة 796.00 درهم لدى شركات الشحن لم يتم تسويتها بعد.",
      "financial_impact": "796.00",
      "action_label": "قم بمطالبة شركة التوصيل بتقرير التحويل البنكي ومطابقة فواتير الإيداع عبر قسم تسوية COD."
    },
    {
      "id": "2",
      "severity": "medium",
      "type": "opportunity",
      "title": "تنبيه نفاد المخزون لـ (1) منتجات",
      "message": "المنتجات التالية اقتربت من النفاد: فرشاة تمليس الشعر الحرارية الاحترافية (Hair Styler). قد يؤدي نفادها إلى توقف الحملات الإعلانية وخسارة المبيعات.",
      "financial_impact": "0.00",
      "action_label": "إرسال طلب توريد جديد للمورد لتفادي انقطاع البيع."
    }
  ],
  "/api/v1/orders": [
    {
      "id": 36,
      "store_id": 16,
      "order_number": "PP-1021",
      "external_ref": "SHOPIFY-4789",
      "customer_id": 22,
      "customer_name": "أحمد المنصوري (Ahmed Mansouri)",
      "customer_phone": "+212 662-778899",
      "customer_city": "مراكش (Marrakech)",
      "delivery_company_id": 1,
      "delivery_company_name": "Cathedis Express",
      "order_status": "pending",
      "payment_status": "pending",
      "delivery_status": "pending",
      "tracking_number": null,
      "subtotal": "249.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "249.00",
      "cogs_total": "65.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "0.00",
      "net_profit": "144.00",
      "cod_amount": "249.00",
      "cod_collected_amount": "0.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-21T17:46:29.277104",
      "delivered_at": null,
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": "طلب تجريبي تلقائي تم استقباله عبر Shopify Webhook",
      "items": [
        {
          "id": 36,
          "product_id": 4,
          "product_title_snapshot": "خلاط محمول ذكي قابل للشحن",
          "sku_snapshot": "SKU-SHOPIFY-4789",
          "purchase_cost_snapshot": "65.00",
          "unit_price": "249.00",
          "quantity": 1,
          "total_price": "249.00"
        }
      ]
    },
    {
      "id": 35,
      "store_id": 16,
      "order_number": "PP-1020",
      "external_ref": "WC-4779",
      "customer_id": 21,
      "customer_name": "سارة الإدريسي (Sara Idrissi)",
      "customer_phone": "+212 663-889900",
      "customer_city": "الرباط (Rabat)",
      "delivery_company_id": 1,
      "delivery_company_name": "Cathedis Express",
      "order_status": "pending",
      "payment_status": "pending",
      "delivery_status": "pending",
      "tracking_number": null,
      "subtotal": "299.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "299.00",
      "cogs_total": "85.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "0.00",
      "net_profit": "174.00",
      "cod_amount": "299.00",
      "cod_collected_amount": "0.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-21T17:46:19.634158",
      "delivered_at": null,
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": "طلب تجريبي تلقائي تم استقباله عبر WooCommerce Webhook",
      "items": [
        {
          "id": 35,
          "product_id": 6,
          "product_title_snapshot": "فرشاة تمليس الشعر الحرارية الاحترافية",
          "sku_snapshot": "SKU-WOOCOMMERCE-4779",
          "purchase_cost_snapshot": "85.00",
          "unit_price": "299.00",
          "quantity": 1,
          "total_price": "299.00"
        }
      ]
    },
    {
      "id": 34,
      "store_id": 16,
      "order_number": "PP-1019",
      "external_ref": null,
      "customer_id": 20,
      "customer_name": "كريم العلمي (Karim Alami)",
      "customer_phone": "+212 661-123456",
      "customer_city": "الدار البيضاء (Casablanca)",
      "delivery_company_id": 1,
      "delivery_company_name": "Cathedis Express",
      "order_status": "pending",
      "payment_status": "pending",
      "delivery_status": "pending",
      "tracking_number": null,
      "subtotal": "249.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "249.00",
      "cogs_total": "65.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "0.00",
      "net_profit": "144.00",
      "cod_amount": "249.00",
      "cod_collected_amount": "0.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-21T17:40:56.240571",
      "delivered_at": null,
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": "طلب مباشر للزبون كريم العلمي (Karim Alami)",
      "items": [
        {
          "id": 34,
          "product_id": 1,
          "product_title_snapshot": "خلاط محمول ذكي قابل للشحن",
          "sku_snapshot": "SKU-PROD-1",
          "purchase_cost_snapshot": "65.00",
          "unit_price": "249.00",
          "quantity": 1,
          "total_price": "249.00"
        }
      ]
    },
    {
      "id": 33,
      "store_id": 16,
      "order_number": "PP-2008",
      "external_ref": null,
      "customer_id": 4,
      "customer_name": "أمين العلمي",
      "customer_phone": "+212661123456",
      "customer_city": "الدار البيضاء",
      "delivery_company_id": 3,
      "delivery_company_name": "Amana Express",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-MAR-2008",
      "subtotal": "149.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "149.00",
      "cogs_total": "35.00",
      "delivery_cost_actual": "40.00",
      "return_cost_actual": "0.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "44.00",
      "cod_amount": "149.00",
      "cod_collected_amount": "149.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-13T17:05:17.305952",
      "delivered_at": "2026-10-21T17:05:17.305952",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 33,
          "product_id": 7,
          "product_title_snapshot": "مصباح الطاقة الشمسية مع مستشعر الحركة (Solar LED)",
          "sku_snapshot": "SOLAR-LED-04",
          "purchase_cost_snapshot": "35.00",
          "unit_price": "149.00",
          "quantity": 1,
          "total_price": "149.00"
        }
      ]
    },
    {
      "id": 32,
      "store_id": 16,
      "order_number": "PP-2007",
      "external_ref": null,
      "customer_id": 11,
      "customer_name": "طارق الفيلالي",
      "customer_phone": "+212668890123",
      "customer_city": "وجدة",
      "delivery_company_id": 2,
      "delivery_company_name": "Ozon Delivery",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-MAR-2007",
      "subtotal": "299.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "299.00",
      "cogs_total": "85.00",
      "delivery_cost_actual": "38.00",
      "return_cost_actual": "0.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "146.00",
      "cod_amount": "299.00",
      "cod_collected_amount": "299.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-14T17:05:17.305952",
      "delivered_at": "2026-10-21T17:05:17.305952",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 32,
          "product_id": 6,
          "product_title_snapshot": "فرشاة تمليس الشعر الحرارية الاحترافية (Hair Styler)",
          "sku_snapshot": "HAIR-BRSH-03",
          "purchase_cost_snapshot": "85.00",
          "unit_price": "299.00",
          "quantity": 1,
          "total_price": "299.00"
        }
      ]
    },
    {
      "id": 31,
      "store_id": 16,
      "order_number": "PP-2006",
      "external_ref": null,
      "customer_id": 10,
      "customer_name": "سارة المرابط",
      "customer_phone": "+212667789012",
      "customer_city": "القنيطرة",
      "delivery_company_id": 1,
      "delivery_company_name": "Cathedis Express",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-MAR-2006",
      "subtotal": "199.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "199.00",
      "cogs_total": "48.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "0.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "86.00",
      "cod_amount": "199.00",
      "cod_collected_amount": "199.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-15T17:05:17.304706",
      "delivered_at": "2026-10-21T17:05:17.304706",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 31,
          "product_id": 5,
          "product_title_snapshot": "وسادة طبية لدعم الظهر والفقرات (Orthopedic Cushion)",
          "sku_snapshot": "CUSH-ORTHO-02",
          "purchase_cost_snapshot": "48.00",
          "unit_price": "199.00",
          "quantity": 1,
          "total_price": "199.00"
        }
      ]
    },
    {
      "id": 30,
      "store_id": 16,
      "order_number": "PP-2005",
      "external_ref": null,
      "customer_id": 9,
      "customer_name": "رشيد الإدريسي",
      "customer_phone": "+212666678901",
      "customer_city": "أكادير",
      "delivery_company_id": 3,
      "delivery_company_name": "Amana Express",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-MAR-2005",
      "subtotal": "249.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "249.00",
      "cogs_total": "65.00",
      "delivery_cost_actual": "40.00",
      "return_cost_actual": "0.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "114.00",
      "cod_amount": "249.00",
      "cod_collected_amount": "249.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-16T17:05:17.302092",
      "delivered_at": "2026-10-21T17:05:17.302092",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 30,
          "product_id": 4,
          "product_title_snapshot": "خلاط محمول ذكي قابل للشحن (Smart USB Blender)",
          "sku_snapshot": "BLND-PRO-01",
          "purchase_cost_snapshot": "65.00",
          "unit_price": "249.00",
          "quantity": 1,
          "total_price": "249.00"
        }
      ]
    },
    {
      "id": 29,
      "store_id": 16,
      "order_number": "PP-2004",
      "external_ref": null,
      "customer_id": 8,
      "customer_name": "حمزة البورقادي",
      "customer_phone": "+212665567890",
      "customer_city": "فاس",
      "delivery_company_id": 2,
      "delivery_company_name": "Ozon Delivery",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-MAR-2004",
      "subtotal": "99.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "99.00",
      "cogs_total": "25.00",
      "delivery_cost_actual": "38.00",
      "return_cost_actual": "0.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "6.00",
      "cod_amount": "99.00",
      "cod_collected_amount": "99.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-17T17:05:17.301271",
      "delivered_at": "2026-10-21T17:05:17.301271",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 29,
          "product_id": 8,
          "product_title_snapshot": "مضخة مياه كهربائية أوتوماتيكية للبراميل (Water Pump)",
          "sku_snapshot": "AUTO-PUMP-05",
          "purchase_cost_snapshot": "25.00",
          "unit_price": "99.00",
          "quantity": 1,
          "total_price": "99.00"
        }
      ]
    },
    {
      "id": 28,
      "store_id": 16,
      "order_number": "PP-2003",
      "external_ref": null,
      "customer_id": 7,
      "customer_name": "مريم السوسي",
      "customer_phone": "+212664456789",
      "customer_city": "طنجة",
      "delivery_company_id": 1,
      "delivery_company_name": "Cathedis Express",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-MAR-2003",
      "subtotal": "149.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "149.00",
      "cogs_total": "35.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "0.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "49.00",
      "cod_amount": "149.00",
      "cod_collected_amount": "149.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-18T17:05:17.298844",
      "delivered_at": "2026-10-21T17:05:17.298844",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 28,
          "product_id": 7,
          "product_title_snapshot": "مصباح الطاقة الشمسية مع مستشعر الحركة (Solar LED)",
          "sku_snapshot": "SOLAR-LED-04",
          "purchase_cost_snapshot": "35.00",
          "unit_price": "149.00",
          "quantity": 1,
          "total_price": "149.00"
        }
      ]
    },
    {
      "id": 27,
      "store_id": 16,
      "order_number": "PP-2002",
      "external_ref": null,
      "customer_id": 6,
      "customer_name": "يوسف التازي",
      "customer_phone": "+212663345678",
      "customer_city": "مراكش",
      "delivery_company_id": 3,
      "delivery_company_name": "Amana Express",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-MAR-2002",
      "subtotal": "299.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "299.00",
      "cogs_total": "85.00",
      "delivery_cost_actual": "40.00",
      "return_cost_actual": "0.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "144.00",
      "cod_amount": "299.00",
      "cod_collected_amount": "299.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-19T17:05:17.292251",
      "delivered_at": "2026-10-21T17:05:17.292251",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 27,
          "product_id": 6,
          "product_title_snapshot": "فرشاة تمليس الشعر الحرارية الاحترافية (Hair Styler)",
          "sku_snapshot": "HAIR-BRSH-03",
          "purchase_cost_snapshot": "85.00",
          "unit_price": "299.00",
          "quantity": 1,
          "total_price": "299.00"
        }
      ]
    },
    {
      "id": 26,
      "store_id": 16,
      "order_number": "PP-2001",
      "external_ref": null,
      "customer_id": 5,
      "customer_name": "فاطمة الزهراء بنجلون",
      "customer_phone": "+212662234567",
      "customer_city": "الرباط",
      "delivery_company_id": 2,
      "delivery_company_name": "Ozon Delivery",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-MAR-2001",
      "subtotal": "199.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "199.00",
      "cogs_total": "48.00",
      "delivery_cost_actual": "38.00",
      "return_cost_actual": "0.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "83.00",
      "cod_amount": "199.00",
      "cod_collected_amount": "199.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-20T17:05:17.286427",
      "delivered_at": "2026-10-21T17:05:17.286427",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 26,
          "product_id": 5,
          "product_title_snapshot": "وسادة طبية لدعم الظهر والفقرات (Orthopedic Cushion)",
          "sku_snapshot": "CUSH-ORTHO-02",
          "purchase_cost_snapshot": "48.00",
          "unit_price": "199.00",
          "quantity": 1,
          "total_price": "199.00"
        }
      ]
    },
    {
      "id": 15,
      "store_id": 16,
      "order_number": "PP-1010",
      "external_ref": null,
      "customer_id": 5,
      "customer_name": "فاطمة الزهراء بنجلون",
      "customer_phone": "+212662234567",
      "customer_city": "الرباط",
      "delivery_company_id": 1,
      "delivery_company_name": "Cathedis Express",
      "order_status": "pending",
      "payment_status": "pending",
      "delivery_status": "pending",
      "tracking_number": "TRK-CAT-1010",
      "subtotal": "198.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "198.00",
      "cogs_total": "50.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "6.00",
      "ad_spend_attributed": "20.00",
      "net_profit": "87.00",
      "cod_amount": "198.00",
      "cod_collected_amount": "0.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-13T16:54:37.725990",
      "delivered_at": null,
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 15,
          "product_id": 8,
          "product_title_snapshot": "مضخة مياه كهربائية أوتوماتيكية للبراميل (Water Pump)",
          "sku_snapshot": "AUTO-PUMP-05",
          "purchase_cost_snapshot": "25.00",
          "unit_price": "99.00",
          "quantity": 2,
          "total_price": "198.00"
        }
      ]
    },
    {
      "id": 14,
      "store_id": 16,
      "order_number": "PP-1009",
      "external_ref": null,
      "customer_id": 4,
      "customer_name": "أمين العلمي",
      "customer_phone": "+212661123456",
      "customer_city": "الدار البيضاء",
      "delivery_company_id": 3,
      "delivery_company_name": "Amana Express",
      "order_status": "confirmed",
      "payment_status": "pending",
      "delivery_status": "pending",
      "tracking_number": "TRK-AMA-1009",
      "subtotal": "149.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "149.00",
      "cogs_total": "35.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "4.00",
      "ad_spend_attributed": "22.00",
      "net_profit": "53.00",
      "cod_amount": "149.00",
      "cod_collected_amount": "0.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-12T16:54:37.724851",
      "delivered_at": null,
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 14,
          "product_id": 7,
          "product_title_snapshot": "مصباح الطاقة الشمسية مع مستشعر الحركة (Solar LED)",
          "sku_snapshot": "SOLAR-LED-04",
          "purchase_cost_snapshot": "35.00",
          "unit_price": "149.00",
          "quantity": 1,
          "total_price": "149.00"
        }
      ]
    },
    {
      "id": 13,
      "store_id": 16,
      "order_number": "PP-1008",
      "external_ref": null,
      "customer_id": 11,
      "customer_name": "طارق الفيلالي",
      "customer_phone": "+212668890123",
      "customer_city": "وجدة",
      "delivery_company_id": 2,
      "delivery_company_name": "Ozon Delivery",
      "order_status": "shipped",
      "payment_status": "pending",
      "delivery_status": "in_transit",
      "tracking_number": "TRK-OZO-1008",
      "subtotal": "299.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "299.00",
      "cogs_total": "85.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "149.00",
      "cod_amount": "299.00",
      "cod_collected_amount": "0.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-11T16:54:37.723337",
      "delivered_at": null,
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 13,
          "product_id": 6,
          "product_title_snapshot": "فرشاة تمليس الشعر الحرارية الاحترافية (Hair Styler)",
          "sku_snapshot": "HAIR-BRSH-03",
          "purchase_cost_snapshot": "85.00",
          "unit_price": "299.00",
          "quantity": 1,
          "total_price": "299.00"
        }
      ]
    },
    {
      "id": 12,
      "store_id": 16,
      "order_number": "PP-1007",
      "external_ref": null,
      "customer_id": 10,
      "customer_name": "سارة المرابط",
      "customer_phone": "+212667789012",
      "customer_city": "القنيطرة",
      "delivery_company_id": 1,
      "delivery_company_name": "Cathedis Express",
      "order_status": "returned",
      "payment_status": "refunded",
      "delivery_status": "returned",
      "tracking_number": "TRK-CAT-1007",
      "subtotal": "199.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "199.00",
      "cogs_total": "48.00",
      "delivery_cost_actual": "38.00",
      "return_cost_actual": "22.00",
      "packaging_cost": "6.00",
      "ad_spend_attributed": "28.00",
      "net_profit": "-56.00",
      "cod_amount": "199.00",
      "cod_collected_amount": "0.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-19T16:54:37.721337",
      "delivered_at": null,
      "returned_at": "2026-10-22T16:54:37.721337",
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 12,
          "product_id": 5,
          "product_title_snapshot": "وسادة طبية لدعم الظهر والفقرات (Orthopedic Cushion)",
          "sku_snapshot": "CUSH-ORTHO-02",
          "purchase_cost_snapshot": "48.00",
          "unit_price": "199.00",
          "quantity": 1,
          "total_price": "199.00"
        }
      ]
    },
    {
      "id": 11,
      "store_id": 16,
      "order_number": "PP-1006",
      "external_ref": null,
      "customer_id": 9,
      "customer_name": "رشيد الإدريسي",
      "customer_phone": "+212666678901",
      "customer_city": "أكادير",
      "delivery_company_id": 3,
      "delivery_company_name": "Amana Express",
      "order_status": "returned",
      "payment_status": "refunded",
      "delivery_status": "returned",
      "tracking_number": "TRK-AMA-1006",
      "subtotal": "249.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "249.00",
      "cogs_total": "65.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "30.00",
      "net_profit": "-55.00",
      "cod_amount": "249.00",
      "cod_collected_amount": "0.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-18T16:54:37.720337",
      "delivered_at": null,
      "returned_at": "2026-10-21T16:54:37.720337",
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 11,
          "product_id": 4,
          "product_title_snapshot": "خلاط محمول ذكي قابل للشحن (Smart USB Blender)",
          "sku_snapshot": "BLND-PRO-01",
          "purchase_cost_snapshot": "65.00",
          "unit_price": "249.00",
          "quantity": 1,
          "total_price": "249.00"
        }
      ]
    },
    {
      "id": 10,
      "store_id": 16,
      "order_number": "PP-1005",
      "external_ref": null,
      "customer_id": 8,
      "customer_name": "حمزة البورقادي",
      "customer_phone": "+212665567890",
      "customer_city": "فاس",
      "delivery_company_id": 2,
      "delivery_company_name": "Ozon Delivery",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-OZO-1005",
      "subtotal": "99.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "99.00",
      "cogs_total": "25.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "3.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "11.00",
      "cod_amount": "99.00",
      "cod_collected_amount": "99.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-17T16:54:37.719336",
      "delivered_at": "2026-10-19T16:54:37.719336",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 10,
          "product_id": 8,
          "product_title_snapshot": "مضخة مياه كهربائية أوتوماتيكية للبراميل (Water Pump)",
          "sku_snapshot": "AUTO-PUMP-05",
          "purchase_cost_snapshot": "25.00",
          "unit_price": "99.00",
          "quantity": 1,
          "total_price": "99.00"
        }
      ]
    },
    {
      "id": 9,
      "store_id": 16,
      "order_number": "PP-1004",
      "external_ref": null,
      "customer_id": 7,
      "customer_name": "مريم السوسي",
      "customer_phone": "+212664456789",
      "customer_city": "طنجة",
      "delivery_company_id": 1,
      "delivery_company_name": "Cathedis Express",
      "order_status": "delivered",
      "payment_status": "settled",
      "delivery_status": "delivered",
      "tracking_number": "TRK-CAT-1004",
      "subtotal": "298.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "298.00",
      "cogs_total": "70.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "8.00",
      "ad_spend_attributed": "20.00",
      "net_profit": "165.00",
      "cod_amount": "298.00",
      "cod_collected_amount": "298.00",
      "cod_settled_amount": "298.00",
      "created_at": "2026-10-16T16:54:37.718336",
      "delivered_at": "2026-10-18T16:54:37.718336",
      "returned_at": null,
      "settled_at": "2026-10-21T16:54:37.718336",
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 9,
          "product_id": 7,
          "product_title_snapshot": "مصباح الطاقة الشمسية مع مستشعر الحركة (Solar LED)",
          "sku_snapshot": "SOLAR-LED-04",
          "purchase_cost_snapshot": "35.00",
          "unit_price": "149.00",
          "quantity": 2,
          "total_price": "298.00"
        }
      ]
    },
    {
      "id": 8,
      "store_id": 16,
      "order_number": "PP-1003",
      "external_ref": null,
      "customer_id": 6,
      "customer_name": "يوسف التازي",
      "customer_phone": "+212663345678",
      "customer_city": "مراكش",
      "delivery_company_id": 3,
      "delivery_company_name": "Amana Express",
      "order_status": "delivered",
      "payment_status": "settled",
      "delivery_status": "delivered",
      "tracking_number": "TRK-AMA-1003",
      "subtotal": "299.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "299.00",
      "cogs_total": "85.00",
      "delivery_cost_actual": "38.00",
      "return_cost_actual": "22.00",
      "packaging_cost": "5.00",
      "ad_spend_attributed": "30.00",
      "net_profit": "141.00",
      "cod_amount": "299.00",
      "cod_collected_amount": "299.00",
      "cod_settled_amount": "299.00",
      "created_at": "2026-10-15T16:54:37.717337",
      "delivered_at": "2026-10-17T16:54:37.717337",
      "returned_at": null,
      "settled_at": "2026-10-20T16:54:37.717337",
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 8,
          "product_id": 6,
          "product_title_snapshot": "فرشاة تمليس الشعر الحرارية الاحترافية (Hair Styler)",
          "sku_snapshot": "HAIR-BRSH-03",
          "purchase_cost_snapshot": "85.00",
          "unit_price": "299.00",
          "quantity": 1,
          "total_price": "299.00"
        }
      ]
    },
    {
      "id": 7,
      "store_id": 16,
      "order_number": "PP-1002",
      "external_ref": null,
      "customer_id": 5,
      "customer_name": "فاطمة الزهراء بنجلون",
      "customer_phone": "+212662234567",
      "customer_city": "الرباط",
      "delivery_company_id": 2,
      "delivery_company_name": "Ozon Delivery",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-OZO-1002",
      "subtotal": "199.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "199.00",
      "cogs_total": "48.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "6.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "85.00",
      "cod_amount": "199.00",
      "cod_collected_amount": "199.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-14T16:54:37.709802",
      "delivered_at": "2026-10-16T16:54:37.709802",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 7,
          "product_id": 5,
          "product_title_snapshot": "وسادة طبية لدعم الظهر والفقرات (Orthopedic Cushion)",
          "sku_snapshot": "CUSH-ORTHO-02",
          "purchase_cost_snapshot": "48.00",
          "unit_price": "199.00",
          "quantity": 1,
          "total_price": "199.00"
        }
      ]
    },
    {
      "id": 6,
      "store_id": 16,
      "order_number": "PP-1001",
      "external_ref": null,
      "customer_id": 4,
      "customer_name": "أمين العلمي",
      "customer_phone": "+212661123456",
      "customer_city": "الدار البيضاء",
      "delivery_company_id": 1,
      "delivery_company_name": "Cathedis Express",
      "order_status": "delivered",
      "payment_status": "collected",
      "delivery_status": "delivered",
      "tracking_number": "TRK-CAT-1001",
      "subtotal": "498.00",
      "shipping_fee_charged": "0.00",
      "discount_amount": "0.00",
      "total_amount": "498.00",
      "cogs_total": "130.00",
      "delivery_cost_actual": "35.00",
      "return_cost_actual": "20.00",
      "packaging_cost": "10.00",
      "ad_spend_attributed": "25.00",
      "net_profit": "298.00",
      "cod_amount": "498.00",
      "cod_collected_amount": "498.00",
      "cod_settled_amount": "0.00",
      "created_at": "2026-10-13T16:54:37.706799",
      "delivered_at": "2026-10-15T16:54:37.706799",
      "returned_at": null,
      "settled_at": null,
      "cancel_reason": null,
      "notes": null,
      "items": [
        {
          "id": 6,
          "product_id": 4,
          "product_title_snapshot": "خلاط محمول ذكي قابل للشحن (Smart USB Blender)",
          "sku_snapshot": "BLND-PRO-01",
          "purchase_cost_snapshot": "65.00",
          "unit_price": "249.00",
          "quantity": 2,
          "total_price": "498.00"
        }
      ]
    }
  ],
  "/api/v1/products": [
    {
      "sku": "AUTO-PUMP-05",
      "title": "مضخة مياه كهربائية أوتوماتيكية للبراميل (Water Pump)",
      "description": null,
      "category": "أدوات منزلية",
      "barcode": null,
      "purchase_cost": "25.00",
      "selling_price": "99.00",
      "packaging_cost": "3.00",
      "stock_quantity": 30,
      "reorder_threshold": 10,
      "weight_kg": "0.500",
      "image_url": null,
      "is_active": true,
      "id": 8,
      "store_id": 16,
      "created_at": "2026-10-21T16:54:37.704200",
      "nominal_margin": "74.00",
      "nominal_margin_pct": "74.75"
    },
    {
      "sku": "SOLAR-LED-04",
      "title": "مصباح الطاقة الشمسية مع مستشعر الحركة (Solar LED)",
      "description": null,
      "category": "حديقة وإضاءة",
      "barcode": null,
      "purchase_cost": "35.00",
      "selling_price": "149.00",
      "packaging_cost": "4.00",
      "stock_quantity": 55,
      "reorder_threshold": 10,
      "weight_kg": "0.500",
      "image_url": null,
      "is_active": true,
      "id": 7,
      "store_id": 16,
      "created_at": "2026-10-21T16:54:37.704200",
      "nominal_margin": "114.00",
      "nominal_margin_pct": "76.51"
    },
    {
      "sku": "HAIR-BRSH-03",
      "title": "فرشاة تمليس الشعر الحرارية الاحترافية (Hair Styler)",
      "description": null,
      "category": "عناية وجمال",
      "barcode": null,
      "purchase_cost": "85.00",
      "selling_price": "299.00",
      "packaging_cost": "5.00",
      "stock_quantity": 7,
      "reorder_threshold": 12,
      "weight_kg": "0.500",
      "image_url": null,
      "is_active": true,
      "id": 6,
      "store_id": 16,
      "created_at": "2026-10-21T16:54:37.704200",
      "nominal_margin": "214.00",
      "nominal_margin_pct": "71.57"
    },
    {
      "sku": "CUSH-ORTHO-02",
      "title": "وسادة طبية لدعم الظهر والفقرات (Orthopedic Cushion)",
      "description": null,
      "category": "صحة وراحة",
      "barcode": null,
      "purchase_cost": "48.00",
      "selling_price": "199.00",
      "packaging_cost": "6.00",
      "stock_quantity": 68,
      "reorder_threshold": 20,
      "weight_kg": "0.500",
      "image_url": null,
      "is_active": true,
      "id": 5,
      "store_id": 16,
      "created_at": "2026-10-21T16:54:37.704200",
      "nominal_margin": "151.00",
      "nominal_margin_pct": "75.88"
    },
    {
      "sku": "BLND-PRO-01",
      "title": "خلاط محمول ذكي قابل للشحن (Smart USB Blender)",
      "description": null,
      "category": "أدوات منزلية",
      "barcode": null,
      "purchase_cost": "65.00",
      "selling_price": "249.00",
      "packaging_cost": "5.00",
      "stock_quantity": 41,
      "reorder_threshold": 15,
      "weight_kg": "0.500",
      "image_url": null,
      "is_active": true,
      "id": 4,
      "store_id": 16,
      "created_at": "2026-10-21T16:54:37.704200",
      "nominal_margin": "184.00",
      "nominal_margin_pct": "73.90"
    }
  ],
  "/api/v1/delivery/companies": [
    {
      "name": "Cathedis Express",
      "phone": "+212522001122",
      "email": "contact@cathedis.ma",
      "shipping_rate_default": "35.00",
      "return_fee_default": "20.00",
      "tracking_url_template": null,
      "city_rates": "{\"الدار البيضاء (Casablanca)\": 22.0, \"مراكش (Marrakech)\": 34.0, \"العيون (Laayoune)\": 50.0}",
      "is_active": true,
      "id": 1,
      "store_id": null,
      "created_at": "2026-10-21T16:54:37.702201",
      "pending_cod_amount": "846.00",
      "active_deliveries_count": 0
    },
    {
      "name": "Ozon Delivery",
      "phone": "+212522334455",
      "email": "support@ozon.ma",
      "shipping_rate_default": "38.00",
      "return_fee_default": "22.00",
      "tracking_url_template": null,
      "city_rates": "{\"الدار البيضاء (Casablanca)\": 25.0, \"الرباط (Rabat)\": 32.0, \"سلا (Sale)\": 32.0, \"مراكش (Marrakech)\": 35.0, \"طنجة (Tanger)\": 38.0, \"فاس (Fes)\": 38.0, \"مكناس (Meknes)\": 38.0, \"أكادير (Agadir)\": 40.0, \"وجدة (Oujda)\": 45.0, \"الناظور (Nador)\": 45.0, \"تطوان (Tetouan)\": 38.0, \"القنيطرة (Kenitra)\": 30.0, \"المحمدية (Mohammedia)\": 25.0, \"العيون (Laayoune)\": 55.0, \"الداخلة (Dakhla)\": 60.0}",
      "is_active": true,
      "id": 2,
      "store_id": null,
      "created_at": "2026-10-21T16:54:37.702201",
      "pending_cod_amount": "895.00",
      "active_deliveries_count": 1
    },
    {
      "name": "Amana Express",
      "phone": "+212537000111",
      "email": "amana@poste.ma",
      "shipping_rate_default": "40.00",
      "return_fee_default": "20.00",
      "tracking_url_template": null,
      "city_rates": "{\"الدار البيضاء (Casablanca)\": 25.0, \"الرباط (Rabat)\": 32.0, \"سلا (Sale)\": 32.0, \"مراكش (Marrakech)\": 35.0, \"طنجة (Tanger)\": 38.0, \"فاس (Fes)\": 38.0, \"مكناس (Meknes)\": 38.0, \"أكادير (Agadir)\": 40.0, \"وجدة (Oujda)\": 45.0, \"الناظور (Nador)\": 45.0, \"تطوان (Tetouan)\": 38.0, \"القنيطرة (Kenitra)\": 30.0, \"المحمدية (Mohammedia)\": 25.0, \"العيون (Laayoune)\": 55.0, \"الداخلة (Dakhla)\": 60.0}",
      "is_active": true,
      "id": 3,
      "store_id": null,
      "created_at": "2026-10-21T16:54:37.702201",
      "pending_cod_amount": "697.00",
      "active_deliveries_count": 1
    }
  ],
  "/api/v1/delivery/settlements": [],
  "/api/v1/marketing/campaigns": [
    {
      "id": 1,
      "store_id": 16,
      "platform": "meta",
      "campaign_name": "[Meta] الخلاط الذكي — حملة التحويلات",
      "campaign_id_ext": null,
      "status": "active",
      "created_at": "2026-10-21T16:54:37.727988",
      "total_spend": "280.00",
      "reported_conversions": 7,
      "roas": "6.23",
      "cpa": "40.00",
      "records": [
        {
          "id": 1,
          "campaign_id": 1,
          "date": "2026-10-20",
          "spend": "280.00",
          "impressions": 14500,
          "clicks": 420,
          "conversions_reported": 7,
          "attributed_revenue": "1743.00"
        }
      ]
    },
    {
      "id": 2,
      "store_id": 16,
      "platform": "tiktok",
      "campaign_name": "[TikTok] وسادة الفقرات الطبية — فيديو الفيرال",
      "campaign_id_ext": null,
      "status": "active",
      "created_at": "2026-10-21T16:54:37.729985",
      "total_spend": "190.00",
      "reported_conversions": 5,
      "roas": "5.24",
      "cpa": "38.00",
      "records": [
        {
          "id": 2,
          "campaign_id": 2,
          "date": "2026-10-20",
          "spend": "190.00",
          "impressions": 21000,
          "clicks": 610,
          "conversions_reported": 5,
          "attributed_revenue": "995.00"
        }
      ]
    }
  ],
  "/api/v1/inventory/status": {
    "total_products_count": 5,
    "total_units_in_stock": 201,
    "total_inventory_valuation": "9199.00",
    "low_stock_products_count": 1,
    "dead_stock_products_count": 0,
    "average_days_of_stock_remaining": "45.0"
  }
};

    let ordersList = [...(RAW_MOCK_DATA["/api/v1/orders"] || [])];
    let productsList = [...(RAW_MOCK_DATA["/api/v1/products"] || [])];
    let campaignsList = [...(RAW_MOCK_DATA["/api/v1/marketing/campaigns"] || [])];

    const isDemoEnvironment = 
        window.location.hostname.includes("github.io") || 
        window.location.protocol === "file:" ||
        new URLSearchParams(window.location.search).has("demo") ||
        (!window.location.origin.includes(":8000") && !window.location.origin.includes(":5000"));

    if (isDemoEnvironment) {
        console.log("🌟 ProfitPilot AI running in Live Interactive GitHub Demo Mode!");

        // Inject Demo Banner into Header
        window.addEventListener("DOMContentLoaded", () => {
            const header = document.querySelector(".topbar");
            if (header) {
                const banner = document.createElement("div");
                banner.id = "github-demo-banner";
                banner.style.cssText = "background: linear-gradient(90deg, #0284c7 0%, #2563eb 100%); color: #ffffff; padding: 6px 14px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; border-radius: 6px; margin: 0 16px 10px 16px; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);";
                banner.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>🚀</span>
                        <span><strong>وضع العرض التجريبي المباشر (GitHub Live Demo)</strong> — بيانات تجريبية تفاعلية لمتجر مغربي</span>
                    </div>
                    <div>
                        <a href="https://wa.me/212785132574?text=Salam%20bghit%20nchri%20ProfitPilot%20AI" target="_blank" style="background: #22c55e; color: #ffffff; padding: 4px 12px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 700;">
                            💬 طلب النسخة الكاملة عبر واتساب
                        </a>
                    </div>
                `;
                header.parentNode.insertBefore(banner, header.nextSibling);
            }

            // Pre-fill profile and local storage
            localStorage.setItem("profitpilot_onboarding_completed", "true");
            localStorage.setItem("profitpilot_store_name", DEMO_STORE.name);
            localStorage.setItem("profitpilot_currency", DEMO_STORE.currency);
        });

        // Intercept window.fetch
        const originalFetch = window.fetch;
        window.fetch = async function(resource, init = {}) {
            const url = typeof resource === "string" ? resource : resource.url;
            const method = (init.method || "GET").toUpperCase();

            // Match API endpoints
            if (url.includes("/api/v1/")) {
                const path = url.substring(url.indexOf("/api/v1/"));
                const cleanPath = path.split("?")[0];

                // 1. Auth me
                if (cleanPath === "/api/v1/auth/me" || cleanPath === "/api/v1/auth/login" || cleanPath === "/api/v1/auth/register") {
                    return new Response(JSON.stringify({
                        access_token: "demo_token_12345",
                        token_type: "bearer",
                        active_store: DEMO_STORE
                    }), { status: 200, headers: { "Content-Type": "application/json" } });
                }

                // 2. Dashboard summary
                if (cleanPath === "/api/v1/dashboard/summary") {
                    return new Response(JSON.stringify(RAW_MOCK_DATA["/api/v1/dashboard/summary"]), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                // 3. Dashboard charts
                if (cleanPath === "/api/v1/dashboard/charts") {
                    return new Response(JSON.stringify(RAW_MOCK_DATA["/api/v1/dashboard/charts"]), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                // 4. Alerts
                if (cleanPath === "/api/v1/dashboard/alerts") {
                    return new Response(JSON.stringify(RAW_MOCK_DATA["/api/v1/dashboard/alerts"]), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                // 5. Orders
                if (cleanPath === "/api/v1/orders") {
                    if (method === "POST" && init.body) {
                        try {
                            const newOrder = JSON.parse(init.body);
                            newOrder.id = ordersList.length + 100;
                            newOrder.order_number = "ORD-" + Math.floor(1000 + Math.random() * 9000);
                            newOrder.status = "confirmed";
                            newOrder.created_at = new Date().toISOString();
                            ordersList.unshift(newOrder);
                            return new Response(JSON.stringify(newOrder), { status: 201, headers: { "Content-Type": "application/json" } });
                        } catch (e) {}
                    }
                    return new Response(JSON.stringify(ordersList), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                // 6. Order Status Update
                if (cleanPath.startsWith("/api/v1/orders/") && cleanPath.endsWith("/status")) {
                    const parts = cleanPath.split("/");
                    const orderId = parseInt(parts[parts.length - 2]);
                    if (init.body) {
                        const body = JSON.parse(init.body);
                        const ord = ordersList.find(o => o.id === orderId);
                        if (ord) ord.status = body.status;
                    }
                    return new Response(JSON.stringify({ status: "success", message: "Order updated" }), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                // 7. Products
                if (cleanPath === "/api/v1/products") {
                    if (method === "POST" && init.body) {
                        try {
                            const newProd = JSON.parse(init.body);
                            newProd.id = productsList.length + 10;
                            newProd.break_even_delivery_rate = 38.5;
                            productsList.unshift(newProd);
                            return new Response(JSON.stringify(newProd), { status: 201, headers: { "Content-Type": "application/json" } });
                        } catch (e) {}
                    }
                    return new Response(JSON.stringify(productsList), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                // 8. Delivery Companies & Settlements
                if (cleanPath === "/api/v1/delivery/companies") {
                    return new Response(JSON.stringify(RAW_MOCK_DATA["/api/v1/delivery/companies"]), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                if (cleanPath === "/api/v1/delivery/settlements") {
                    return new Response(JSON.stringify([
                        {
                            id: 1,
                            delivery_company_name: "Cathedis Express",
                            settlement_reference: "SETT-2026-CAT-09",
                            bank_account: "CIH Bank - 230780001234",
                            expected_amount: 1250.0,
                            received_amount: 1100.0,
                            discrepancy_amount: -150.0,
                            status: "reconciled_with_discrepancy",
                            created_at: new Date().toISOString()
                        }
                    ]), { status: 200, headers: { "Content-Type": "application/json" } });
                }

                // 9. Marketing Campaigns
                if (cleanPath === "/api/v1/marketing/campaigns") {
                    return new Response(JSON.stringify(RAW_MOCK_DATA["/api/v1/marketing/campaigns"]), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                // 10. Inventory Status
                if (cleanPath === "/api/v1/inventory/status") {
                    return new Response(JSON.stringify(RAW_MOCK_DATA["/api/v1/inventory/status"]), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                // 11. AI Chat & Advisor
                if (cleanPath === "/api/v1/ai/chat") {
                    return new Response(JSON.stringify({
                        response: "بناءً على تحليل بيانات متجر الأطلس للتجارة: نسبة التسليم ممتازة (86.7%)، وصافي أرباحك الحقيقية 434 درهم. انتبه فقط لوجود 796 درهم معلقة لدى شركات الشحن لم يتم تحويلها لحسابك في CIH Bank، كما نوصي بإعادة طلب مخزون فرشاة تمليس الشعر لتفادي نفاد الكمية."
                    }), { status: 200, headers: { "Content-Type": "application/json" } });
                }

                // 12. AI Copywriter
                if (cleanPath === "/api/v1/ai/catalog/generate") {
                    return new Response(JSON.stringify({
                        ad_hook: "واش باغي تهنى من الشعر المجعد فـ 5 دقايق فقط؟ 😍",
                        ad_body: "الحل النهائي وصل! المشط الحراري السحري الأصلي بتقنية الأيونات السالبة كيحمي شعرك وكيخليه مسبسب وحريري طوال اليوم. توصيل سريع لجميع المدن والدفع عند الاستلام مع ضمان 12 شهر!",
                        call_to_action: "اطلب الآن واستفد من التوصيل المجاني قبل نفاد الكمية!"
                    }), { status: 200, headers: { "Content-Type": "application/json" } });
                }

                // Default fallback for any other endpoint
                return new Response(JSON.stringify({ status: "success", demo: true }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            }

            return originalFetch.apply(this, arguments);
        };
    }
})();
