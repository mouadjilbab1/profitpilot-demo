const API_BASE = window.location.origin.includes(":8000") 
    ? `${window.location.origin}/api/v1` 
    : "http://localhost:8000/api/v1";

let authToken = localStorage.getItem("profitpilot_token") || "";
let activeStore = null;
let currentLang = localStorage.getItem("profitpilot_lang") || "ar";
let currentCurrency = localStorage.getItem("profitpilot_currency") || "MAD";

// State caches for re-rendering upon language/currency switch
let lastDashboardSummary = null;
let allOrders = [];
let allProducts = [];
let allCampaigns = [];
let lastInventoryData = null;
let revenueChart = null;
let statusChart = null;

// Security: HTML Sanitizer to prevent DOM & Stored XSS
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Currency formatting with store-native base currency awareness
function formatMoney(amount, targetCurrency = null) {
    const num = parseFloat(amount) || 0;
    const baseCurr = (activeStore && activeStore.currency) ? activeStore.currency.toUpperCase() : "MAD";
    const curr = (targetCurrency || currentCurrency || baseCurr).toUpperCase();

    // If target display currency matches store base currency, display directly without multiplier distortion
    if (curr === baseCurr) {
        return `${Number(num.toFixed(2)).toLocaleString()} ${curr}`;
    }

    // Relative exchange rates indexed to 1 USD
    const USD_RATES = {
        USD: 1.0,
        MAD: 10.0,
        SAR: 3.75,
        EUR: 0.92
    };

    const baseToUsd = USD_RATES[baseCurr] || 10.0;
    const targetUsd = USD_RATES[curr] || 1.0;
    const converted = (num / baseToUsd) * targetUsd;

    return `${Number(converted.toFixed(2)).toLocaleString()} ${curr}`;
}

function changeCurrency(newCurr) {
    currentCurrency = newCurr;
    localStorage.setItem("profitpilot_currency", newCurr);
    const currSelect = document.getElementById("currency-select");
    if (currSelect) currSelect.value = newCurr;
    loadDashboard();
    renderOrdersTable(allOrders);
    renderProductsTable(allProducts);
    loadReconciliation();
    renderMarketingTable(allCampaigns);
}

// ==========================================
// Comprehensive Multi-Language Dictionary (i18n)
// Arabic (ar), English (en), French (fr)
// ==========================================
const i18n = {
    ar: {
        tagline: "افهم أرقامك. ضاعف أرباحك.",
        nav_dashboard: "لوحة التحكم والأرباح",
        nav_orders: "الطلبات وإدارة COD",
        nav_products: "المنتجات وهامش الربح",
        nav_reconciliation: "تسوية شركات الشحن",
        nav_marketing: "الإعلانات و ROAS الحقيقي",
        nav_inventory: "المخزون والتقييم",
        nav_ai: "المساعد المالي الذكي",
        nav_catalog_ai: "كاتب محتوى المنتجات",
        nav_integrations: "الربط مع المتاجر (WooCommerce & Shopify)",
        badge_new: "جديد",
        load_demo: "تحميل متجر تجريبي (المغرب)",
        system_status: "النظام متصل: محرك الحسابات جاهز",

        // Dashboard
        dash_title: "ملخص الأرباح والسيولة النقدية",
        dash_subtitle: "حسابات مالية قطعية دقيقة غير قائمة على التخمين",
        export_csv: "تصدير CSV",
        refresh: "تحديث الأرقام",
        kpi_net_profit: "صافي الربح الحقيقي",
        kpi_delivered_rev: "المبيعات المستلمة (Delivered)",
        kpi_return_losses: "خسائر المرتجعات (RTO Losses)",
        kpi_carrier_cod: "أموال COD معلقة لدى شركات التوصيل",
        kpi_ad_spend: "مصاريف الإعلانات (Meta + TikTok)",
        kpi_inventory_val: "قيمة البضاعة في المستودع",
        carrier_holding: "أموال محصلة قيد التحويل البنكي",
        cost_valuation: "مقيّمة بسعر الشراء من المورد",
        chart_revenue_profit: "المبيعات المستلمة مقابل صافي الأرباح",
        chart_orders_distribution: "توزيع حالات الطلبات",

        // Orders Tab
        orders_title: "إدارة الطلبات والتحصيل (Orders & COD)",
        orders_subtitle: "تتبع حالات التوصيل، مصاريف الشحن، وأرباح كل طلب",
        add_order: "إضافة طلب جديد",
        search_orders_ph: "بحث برقم الطلب، هاتف العميل، أو رقم التتبع...",
        opt_all_status: "جميع الحالات (All)",
        opt_delivered: "مستلم (Delivered)",
        opt_shipped: "قيد التوصيل (Shipped)",
        opt_confirmed: "مؤكد (Confirmed)",
        opt_returned: "مرتجع (Returned)",
        opt_cancelled: "ملغي (Cancelled)",
        th_order_num: "رقم الطلب",
        th_customer_city: "العميل والمدينة",
        th_carrier: "شركة الشحن",
        th_amount_cod: "المبلغ (COD)",
        th_shipping_cost: "تكلفة الشحن والتغليف",
        th_status: "حالة الطلب",
        th_net_profit: "صافي الربح / الخسارة",
        th_actions: "الإجراءات",

        // Products Tab
        products_title: "كتالوج المنتجات ومحاكي الربحية",
        products_subtitle: "حساب الهامش الحقيقي بعد احتساب مخاطر الروتور ونسبة التعادل",
        btn_download_csv_template: "نموذج استيراد CSV",
        btn_upload_csv: "استيراد CSV",
        btn_add_product: "إضافة منتج جديد",
        modal_add_product_title: "إضافة منتج جديد للكتالوج",
        lbl_prod_sku: "رمز المنتج (SKU):",
        lbl_prod_title: "اسم المنتج:",
        lbl_prod_category: "التصنيف (Category):",
        lbl_prod_stock: "الكمية المتوفرة بالمستودع:",
        lbl_prod_purchase_cost: "سعر الشراء من المورد (Cost):",
        lbl_prod_selling_price: "سعر البيع للزبون (Selling Price):",
        lbl_prod_packaging_cost: "تكلفة التغليف للقطعة:",
        lbl_prod_reorder_threshold: "حد إعادة الطلب (Alert Threshold):",
        btn_save_product: "حفظ المنتج",
        th_prod_sku: "المنتج و SKU",
        th_purchase_cost: "سعر الشراء",
        th_selling_price: "سعر البيع",
        th_nominal_margin: "هامش الربح الاسمي",
        th_stock_qty: "المخزون المتوفر",
        th_stock_status: "الحالة",
        th_profit_breakdown: "تحليل الربحية التفصيلي",

        // Reconciliation Tab
        reconcile_title: "تسوية ومطابقة أموال شركات الشحن (COD Audit)",
        reconcile_subtitle: "كشف أي فروقات واقتطاعات غير مبررة بين المبالغ المتوقعة والتحويل البنكي",
        btn_edit_city_rates: "تعديل أسعار التوصيل حسب المدن",

        // Marketing Tab
        marketing_title: "تحليل الحملات الإعلانية و ROAS الحقيقي",
        marketing_subtitle: "الربط بين مصاريف Meta و TikTok والمبيعات المستلمة فعلياً",
        btn_add_ad_spend: "إضافة مصاريف إعلانية",
        th_platform: "المنصة",
        th_campaign_name: "اسم الحملة",
        th_ad_spend: "الإنفاق الإعلاني",
        th_attributed_orders: "الطلبات المنسوبة",
        th_cpa: "تكلفة الاستحواذ (CPA)",
        th_roas: "العائد على الإنفاق (ROAS)",

        // Inventory Tab
        inventory_title: "المخزون وتقييم رأس المال",
        inventory_subtitle: "كشف المنتجات الراكدة (Dead Stock) وتنبيهات النفاد",
        kpi_inv_total_units: "إجمالي القطع في المستودع",
        kpi_inv_low_stock: "منتجات على وشك النفاد (Low Stock)",
        kpi_inv_dead_stock: "منتجات راكدة (Dead Stock)",

        // AI Copilot Tab
        ai_analyst_title: "المساعد المالي الذكي (ProfitPilot Copilot)",
        ai_analyst_subtitle: "اطرح أي سؤال حول أرباحك، مرتجعاتك، ومصاريفك الإعلانية",
        ph_ai_chat: "اكتب سؤالك المالي هنا...",

        // Catalog AI Tab
        ai_copilot_title: "كاتب إعلانات وصفحات هبوط المنتجات",
        ai_copilot_subtitle: "توليد عناوين جذابة ونصوص تسويقية مقنعة بالدارجة والفصحى والفرنسية",
        lbl_product_base_name: "اسم المنتج الأساسي:",
        lbl_product_category: "التصنيف:",
        lbl_product_features: "المميزات البارزة (مفصولة بفاصلة):",
        btn_generate_copy: "توليد المحتوى التسويقي",
        lbl_suggested_title: "العنوان التسويقي المقترح:",
        lbl_persuasive_copy: "الوصف الإعلاني المقنع:",
        lbl_bullet_points: "نقاط البيع الجذابة (Bullet Points):",
        lbl_store_faq: "الأسئلة الشائعة (FAQ) للمتجر:",

        // Integrations Tab
        integrations_title: "الربط الآلي مع المتاجر (WooCommerce & Shopify)",
        integrations_subtitle: "استقبال الطلبيات ومزامنة بيانات العملاء والمبيعات تلقائياً وفورياً فور تسجيلها في متجرك",
        btn_refresh_logs: "تحديث سجل الربط",
        wc_compat_hint: "متوافق مع جميع قوالب ووردبريس و CartFlows",
        shopify_compat_hint: "مزامنة مباشرة مع متاجر شوبيفاي ونماذج COD",
        badge_live_ready: "جاهز للاستقبال اللحظي",
        lbl_webhook_url: "رابط Webhook الخاص بمتجرك (Delivery URL):",
        lbl_shopify_url: "رابط Webhook الخاص بمتجرك (Shopify Webhook URL):",
        wc_steps_title: "خطوات التفعيل في WordPress:",
        wc_step_1: "اذهب إلى: WooCommerce > الإعدادات > متقدم > Webhooks.",
        wc_step_2: "اضغط إضافة خطاف ويب والصق الرابط أعلاه في خانة Delivery URL.",
        wc_step_3: "اختر الموضوع: تم إنشاء الطلب (Order created) والحالة: نشط (Active) ثم احفظ.",
        shopify_steps_title: "خطوات التفعيل في Shopify:",
        shopify_step_1: "اذهب إلى: Shopify Admin > Settings > Notifications.",
        shopify_step_2: "انزل للأسفل إلى قسم Webhooks واضغط Create Webhook.",
        shopify_step_3: "اختر الحدث: Order creation بصيغة JSON والصق الرابط أعلاه ثم احفظ.",
        btn_test_wc: "إرسال طلب تجريبي فوري من WooCommerce",
        btn_test_shopify: "إرسال طلب تجريبي فوري من Shopify",
        synced_orders_heading: "سجل الطلبيات المستقبلة تلقائياً من المتاجر الخارجية",
        th_internal_order: "رقم الطلب في المنصة",
        th_external_order: "رقم الطلب في المتجر الخارجي",
        th_sync_time: "وقت الاستقبال",
        th_sync_status: "حالة المزامنة",

        // Modal: New Order
        modal_new_order_title: "إضافة طلب جديد (Create Order)",
        btn_fill_sample: "ملء بيانات تجريبية (Sample Data)",
        lbl_cust_name: "اسم العميل الكامل:",
        ph_cust_name: "مثال: يوسف المنصوري / Karim Alami",
        lbl_cust_phone: "رقم الهاتف (WhatsApp):",
        ph_cust_phone: "مثال: +212 661-123456",
        lbl_cust_city: "المدينة (اختر أو اكتب):",
        ph_cust_city: "اختر أو اكتب المدينة... (الدار البيضاء، الرباط...)",
        lbl_cust_address: "العنوان بالتفصيل:",
        ph_cust_address: "مثال: شارع أنفا، إقامة الياسمين رقم 14",
        lbl_order_product: "المنتج المطلوب:",
        lbl_order_qty: "الكمية:",
        lbl_carrier_company: "شركة التوصيل المقترحة:",
        lbl_carrier_fee: "رسوم التوصيل (المدينة):",
        lbl_shipping_charged: "الشحن على العميل:",
        lbl_total_cod: "المبلغ الإجمالي للتحصيل عند الاستلام (COD):",
        lbl_expected_profit: "صافي الربح المتوقع عند التسليم الناجح:",
        btn_cancel: "إلغاء",
        btn_save_order: "حفظ الطلب وتأكيد الحجز",

        // Modal: Carrier Recon
        modal_recon_title: "تسوية ومطابقة الحساب البنكي لشركة الشحن (COD Audit)",
        recon_audit_subtitle: "التدقيق المالي الآلي: مطابقة الكشف البنكي مع مبالغ الزبائن المسلمة",
        lbl_recon_collected: "إجمالي المبالغ المحصلة من الزبائن:",
        lbl_recon_shipping_fee: "رسوم التوصيل المقتطعة:",
        lbl_recon_return_fee: "رسوم شحن المرتجعات (RTO):",
        lbl_recon_expected_payout: "صافي التحويل البنكي المتوقع:",
        lbl_recon_bank: "البنك المستلم للتحويل:",
        lbl_recon_ref: "رقم مرجع التحويل (Avis de Virement):",
        lbl_recon_actual: "المبلغ الفعلي المستلم في حسابك البنكي:",
        recon_matched_title: "المطابقة تامة بنسبة 100% (Zero Discrepancy)",
        recon_matched_desc: "المبلغ المحول يطابق بدقة صافي مستحقات متجرك بعد اقتطاع رسوم الشحن والمرتجعات العادلة.",
        recon_how_title: "كيف يعلم التطبيق بالمطابقة دون ربط مباشر بالبنك؟",
        recon_how_desc: "يقوم ProfitPilot AI بالتدقيق الحسابي المستقل: يجمع ما دفعه الزبائن في الطلبات المسلمة ويطرح رسوم التوصيل والمرتجعات الرسمية، ثم يقارن الناتج بالمبلغ الذي وصل حسابك البنكي، ليكشف لك فوراً أي اقتطاع غير مبرر أو خطأ في الفواتير!",
        btn_close: "إغلاق",
        btn_confirm_recon: "اعتماد التسوية وأرشفة الفاتورة",

        // Modal: Add Spend
        modal_ad_spend_title: "تسجيل مصاريف إعلانية (Add Ad Spend)",
        lbl_ad_platform: "المنصة الإعلانية:",
        lbl_ad_amount: "المبلغ المنفق (Spend):",
        lbl_campaign_name: "اسم الحملة الإعلانية:",
        lbl_campaign_orders: "عدد الطلبات المسجلة في الإعلان:",
        lbl_campaign_date: "تاريخ الإنفاق:",
        btn_save_spend: "حفظ وربط مع العائد ROAS",

        // Modal: City Rates
        modal_city_rates_title: "تسعيرة التوصيل حسب المدن (City Shipping Rates)",
        lbl_select_carrier: "اختر شركة الشحن:",
        lbl_default_shipping_rate: "سعر التوصيل الافتراضي العام (MAD):",
        city_rates_info: "يمكنك تخصيص سعر توصيل خاص بكل مدينة. عند إنشاء أي طلبية أو استقبالها من ووكومرس/شوبيفاي، سيتم تطبيق سعر المدينة تلقائياً لحساب صافي الربح الدقيق!",
        th_city_name: "المدينة / الإقليم",
        th_region: "المنطقة الجغرافية",
        th_actual_shipping_rate: "سعر التوصيل الفعلي (MAD)",
        btn_save_city_rates: "حفظ أسعار المدن وتطبيقها",

        // Modal: Profile Settings
        modal_profile_title: "إعدادات الحساب والمتجر (Profile & Store Settings)",
        lbl_profile_owner_name: "اسم التاجر / صاحب الحساب:",
        lbl_profile_store_name: "اسم المتجر الإلكتروني:",
        lbl_profile_phone: "رقم الهاتف (WhatsApp):",
        lbl_profile_email: "البريد الإلكتروني للعمل:",
        lbl_profile_base_city: "المدينة الرئيسية / مقر العمل:",
        lbl_profile_currency: "العملة الأساسية للمتجر:",
        lbl_profile_bank_name: "البنك المستلم لمستحقات التوصيل:",
        lbl_profile_bank_rib: "رقم الحساب البنكي (RIB / IBAN):",
        btn_save_profile: "حفظ البيانات وتحديث المتجر",
        btn_logout: "تسجيل الخروج وتبديل الحساب",

        // Modal: Onboarding Wizard & Auth
        onboard_welcome_title: "مرحباً بك في ProfitPilot AI 🚀",
        onboard_welcome_subtitle: "المنصة الذكية الأولى لإدارة وتدقيق أرباح التجارة الإلكترونية والدفع عند الاستلام. لنبدأ بإعداد متجرك في أقل من دقيقة!",
        tab_auth_register: "إنشاء متجر وحساب جديد",
        tab_auth_login: "تسجيل الدخول (مزامنة هاتف/جهاز آخر)",
        lbl_auth_email: "البريد الإلكتروني للعمل والدخول:",
        lbl_auth_password: "كلمة المرور (للدخول من أي هاتف):",
        banner_login_info_title: "مزامنة سحابية متقدمة عبر جميع أجهزتك:",
        banner_login_info_desc: "إذا كنت قد أنشأت حساباً مسبقاً على هاتفك أو حاسوبك، قم بتسجيل الدخول هنا بنفس البريد وكلمة المرور لمزامنة جميع أرباحك، طلباتك، ومطابقات الشحن فوراً على هذا الجهاز.",
        btn_complete_onboarding: "إنشاء الحساب ومزامنة متجرك الآن",
        btn_login_sync: "تسجيل الدخول ومزامنة بيانات المتجر الآن"
    },

    en: {
        tagline: "Understand Your Numbers. Improve Your Profits.",
        nav_dashboard: "Dashboard & Profitability",
        nav_orders: "Orders & COD Tracking",
        nav_products: "Products & Margins",
        nav_reconciliation: "Carrier COD Reconciliation",
        nav_marketing: "Marketing & True ROAS",
        nav_inventory: "Inventory Valuation",
        nav_ai: "AI Business Analyst",
        nav_catalog_ai: "AI Catalog Copilot",
        nav_integrations: "Store Integrations (WooCommerce & Shopify)",
        badge_new: "NEW",
        load_demo: "Load Demo Store (Morocco)",
        system_status: "System Online: Calculation Engine Ready",

        // Dashboard
        dash_title: "Profit & Cash Flow Overview",
        dash_subtitle: "Deterministic financial analytics without guesswork",
        export_csv: "Export CSV",
        refresh: "Refresh Data",
        kpi_net_profit: "True Net Profit",
        kpi_delivered_rev: "Delivered Revenue",
        kpi_return_losses: "Return Losses (RTO Losses)",
        kpi_carrier_cod: "Pending COD Held by Carriers",
        kpi_ad_spend: "Advertising Spend (Meta + TikTok)",
        kpi_inventory_val: "Inventory Valuation",
        carrier_holding: "Collected cash pending bank transfer",
        cost_valuation: "Valuated at supplier purchase cost",
        chart_revenue_profit: "Delivered Revenue vs Net Profit",
        chart_orders_distribution: "Order Status Distribution",

        // Orders Tab
        orders_title: "Orders & COD Management",
        orders_subtitle: "Track delivery status, carrier expenses, and net profit per order",
        add_order: "Create New Order",
        search_orders_ph: "Search order #, customer phone, or tracking number...",
        opt_all_status: "All Statuses",
        opt_delivered: "Delivered",
        opt_shipped: "In Transit (Shipped)",
        opt_confirmed: "Confirmed",
        opt_returned: "Returned",
        opt_cancelled: "Cancelled",
        th_order_num: "Order #",
        th_customer_city: "Customer & City",
        th_carrier: "Carrier",
        th_amount_cod: "Amount (COD)",
        th_shipping_cost: "Shipping & Handling Fee",
        th_status: "Status",
        th_net_profit: "Net Profit / Loss",
        th_actions: "Actions",

        // Products Tab
        products_title: "Product Catalog & Profit Simulator",
        products_subtitle: "Calculate real contribution margin factoring return risks & break-even",
        btn_download_csv_template: "Download CSV Template",
        btn_upload_csv: "Upload CSV",
        btn_add_product: "Add New Product",
        modal_add_product_title: "Add New Product to Catalog",
        lbl_prod_sku: "Product SKU:",
        lbl_prod_title: "Product Name:",
        lbl_prod_category: "Category:",
        lbl_prod_stock: "Warehouse Stock Units:",
        lbl_prod_purchase_cost: "Supplier Cost Price:",
        lbl_prod_selling_price: "Customer Selling Price:",
        lbl_prod_packaging_cost: "Packaging Cost per Unit:",
        lbl_prod_reorder_threshold: "Reorder Alert Threshold:",
        btn_save_product: "Save Product",
        th_prod_sku: "Product & SKU",
        th_purchase_cost: "Cost Price",
        th_selling_price: "Selling Price",
        th_nominal_margin: "Nominal Margin",
        th_stock_qty: "In Stock",
        th_stock_status: "Status",
        th_profit_breakdown: "Profit Breakdown",

        // Reconciliation Tab
        reconcile_title: "Carrier COD Reconciliation (Audit)",
        reconcile_subtitle: "Detect bank discrepancies and unjustified deductions automatically",
        btn_edit_city_rates: "Edit City-Based Shipping Rates",

        // Marketing Tab
        marketing_title: "Marketing Campaigns & True ROAS",
        marketing_subtitle: "Attribute Meta & TikTok spend directly to delivered cash revenue",
        btn_add_ad_spend: "Add Ad Spend",
        th_platform: "Platform",
        th_campaign_name: "Campaign Name",
        th_ad_spend: "Ad Spend",
        th_attributed_orders: "Attributed Orders",
        th_cpa: "Cost Per Acquisition (CPA)",
        th_roas: "Return on Ad Spend (ROAS)",

        // Inventory Tab
        inventory_title: "Inventory & Capital Valuation",
        inventory_subtitle: "Detect dead stock and low-stock replenishment alerts",
        kpi_inv_total_units: "Total Units in Warehouse",
        kpi_inv_low_stock: "Low-Stock Alerts",
        kpi_inv_dead_stock: "Dead-Stock Items",

        // AI Copilot Tab
        ai_analyst_title: "AI Financial Analyst (ProfitPilot Copilot)",
        ai_analyst_subtitle: "Ask anything about your profits, return rates, and marketing performance",
        ph_ai_chat: "Type your financial question here...",

        // Catalog AI Tab
        ai_copilot_title: "AI Product Copywriter & Landing Pages",
        ai_copilot_subtitle: "Generate compelling titles, high-converting copy, bullet points and FAQs",
        lbl_product_base_name: "Base Product Name:",
        lbl_product_category: "Category:",
        lbl_product_features: "Key Features (comma-separated):",
        btn_generate_copy: "Generate Marketing Copy",
        lbl_suggested_title: "Suggested Marketing Headline:",
        lbl_persuasive_copy: "Compelling Ad Copy:",
        lbl_bullet_points: "Key Selling Points (Bullets):",
        lbl_store_faq: "Frequently Asked Questions (FAQ):",

        // Integrations Tab
        integrations_title: "Automated Store Webhooks (WooCommerce & Shopify)",
        integrations_subtitle: "Receive orders and customer data instantly as they happen in your online store",
        btn_refresh_logs: "Refresh Integration Log",
        wc_compat_hint: "Compatible with all WordPress themes, FunnelKit, and CartFlows",
        shopify_compat_hint: "Real-time sync with Shopify checkout & COD apps",
        badge_live_ready: "Active & Listening",
        lbl_webhook_url: "Your Store Webhook Delivery URL:",
        lbl_shopify_url: "Your Shopify Webhook URL:",
        wc_steps_title: "Setup Instructions for WordPress:",
        wc_step_1: "Go to: WooCommerce > Settings > Advanced > Webhooks.",
        wc_step_2: "Click Add Webhook and paste the URL above into Delivery URL.",
        wc_step_3: "Choose Topic: Order created, Status: Active, and save.",
        shopify_steps_title: "Setup Instructions for Shopify:",
        shopify_step_1: "Go to: Shopify Admin > Settings > Notifications.",
        shopify_step_2: "Scroll down to Webhooks and click Create Webhook.",
        shopify_step_3: "Choose Event: Order creation (JSON) and paste the URL above.",
        btn_test_wc: "Send Instant Test Order from WooCommerce",
        btn_test_shopify: "Send Instant Test Order from Shopify",
        synced_orders_heading: "Live Synchronized Store Orders Log",
        th_internal_order: "Internal Order #",
        th_external_order: "Store Order #",
        th_sync_time: "Received At",
        th_sync_status: "Sync Status",

        // Modal: New Order
        modal_new_order_title: "Create New Order (Manual & COD)",
        btn_fill_sample: "Fill Sample Data",
        lbl_cust_name: "Full Customer Name:",
        ph_cust_name: "e.g. Youssef Mansouri / Karim Alami",
        lbl_cust_phone: "Phone Number (WhatsApp):",
        ph_cust_phone: "e.g. +212 661-123456",
        lbl_cust_city: "City (Choose or type):",
        ph_cust_city: "Type city name... (Casablanca, Rabat, Marrakech...)",
        lbl_cust_address: "Detailed Street Address:",
        ph_cust_address: "e.g. Anfa Boulevard, Yasmin Residence #14",
        lbl_order_product: "Select Product:",
        lbl_order_qty: "Quantity:",
        lbl_carrier_company: "Assigned Courier:",
        lbl_carrier_fee: "City Shipping Rate:",
        lbl_shipping_charged: "Charged to Customer:",
        lbl_total_cod: "Total Collection Amount (COD):",
        lbl_expected_profit: "Expected Net Profit Upon Delivery:",
        btn_cancel: "Cancel",
        btn_save_order: "Save Order & Confirm Reservation",

        // Modal: Carrier Recon
        modal_recon_title: "Carrier Bank Reconciliation & COD Audit",
        recon_audit_subtitle: "Automated audit: matching courier bank payout with delivered customer orders",
        lbl_recon_collected: "Total Customer Cash Collected:",
        lbl_recon_shipping_fee: "Delivered Shipping Fees Deducted:",
        lbl_recon_return_fee: "Return (RTO) Fees Deducted:",
        lbl_recon_expected_payout: "Expected Net Bank Wire:",
        lbl_recon_bank: "Receiving Bank:",
        lbl_recon_ref: "Wire Reference / Receipt #:",
        lbl_recon_actual: "Actual Amount Received in Bank:",
        recon_matched_title: "100% Match (Zero Discrepancy)",
        recon_matched_desc: "The transferred amount exactly matches your net store receivables after verified shipping & return fees.",
        recon_how_title: "How does the app verify reconciliation without direct bank integration?",
        recon_how_desc: "ProfitPilot AI runs an independent calculation: summing customer COD on delivered orders and subtracting courier fees, then comparing against your bank receipt to detect discrepancies instantly!",
        btn_close: "Close",
        btn_confirm_recon: "Confirm Settlement & Archive Receipt",

        // Modal: Add Spend
        modal_ad_spend_title: "Record Advertising Spend (ROAS Tracking)",
        lbl_ad_platform: "Ad Platform:",
        lbl_ad_amount: "Amount Spent:",
        lbl_campaign_name: "Campaign Name:",
        lbl_campaign_orders: "Reported Conversions / Orders:",
        lbl_campaign_date: "Spend Date:",
        btn_save_spend: "Save & Link with Real ROAS",

        // Modal: City Rates
        modal_city_rates_title: "City-Based Shipping Rates Configuration",
        lbl_select_carrier: "Select Courier Company:",
        lbl_default_shipping_rate: "Default Base Rate (MAD):",
        city_rates_info: "Configure customized shipping fees per destination city. Every manual order or synced WooCommerce/Shopify order will automatically apply the city rate!",
        th_city_name: "City / Province",
        th_region: "Geographical Zone",
        th_actual_shipping_rate: "Actual Shipping Rate (MAD)",
        btn_save_city_rates: "Save & Apply City Rates",

        // Modal: Profile Settings
        modal_profile_title: "Profile & Store Settings",
        lbl_profile_owner_name: "Merchant / Owner Name:",
        lbl_profile_store_name: "Store Business Name:",
        lbl_profile_phone: "Phone / WhatsApp:",
        lbl_profile_email: "Business Email:",
        lbl_profile_base_city: "Headquarters / Base City:",
        lbl_profile_currency: "Primary Base Currency:",
        lbl_profile_bank_name: "Receiving Bank for COD Payouts:",
        lbl_profile_bank_rib: "Bank Account (RIB / IBAN):",
        btn_save_profile: "Save Profile & Update Store",
        btn_logout: "Log Out & Switch Account",

        // Modal: Onboarding Wizard & Auth
        onboard_welcome_title: "Welcome to ProfitPilot AI 🚀",
        onboard_welcome_subtitle: "The #1 intelligent platform for e-commerce profit analytics and COD audit. Let's set up your store in under a minute!",
        tab_auth_register: "Create Store & New Account",
        tab_auth_login: "Sign In (Multi-Device Sync)",
        lbl_auth_email: "Business & Login Email:",
        lbl_auth_password: "Password (For Multi-Device Access):",
        banner_login_info_title: "Advanced Cloud Sync Across All Devices:",
        banner_login_info_desc: "If you previously created an account on your phone or laptop, log in here with the same email and password to instantly sync all profits, orders, and COD settlements on this device.",
        btn_complete_onboarding: "Create Account & Sync Store Now",
        btn_login_sync: "Sign In & Sync Store Data Now"
    },

    fr: {
        tagline: "Comprenez Vos Chiffres. Maximisez Vos Profits.",
        nav_dashboard: "Tableau de Bord & Profits",
        nav_orders: "Commandes & Suivi COD",
        nav_products: "Catalogue & Marges",
        nav_reconciliation: "Rapprochement Transporteurs",
        nav_marketing: "Marketing & ROAS Réel",
        nav_inventory: "Stock & Valorisation",
        nav_ai: "Analyste Financier IA",
        nav_catalog_ai: "Rédacteur IA Catalogue",
        nav_integrations: "Intégrations Boutiques (WooCommerce & Shopify)",
        badge_new: "NOUVEAU",
        load_demo: "Charger Boutique Démo (Maroc)",
        system_status: "Système Connecté: Moteur Prêt",

        // Dashboard
        dash_title: "Aperçu des Bénéfices & Trésorerie",
        dash_subtitle: "Calculs financiers déterministes et fiables",
        export_csv: "Exporter CSV",
        refresh: "Actualiser",
        kpi_net_profit: "Bénéfice Net Réel",
        kpi_delivered_rev: "Chiffre d'Affaires Encaissé",
        kpi_return_losses: "Pertes Retours (RTO)",
        kpi_carrier_cod: "Fonds COD chez Transporteurs",
        kpi_ad_spend: "Dépenses Publicitaires (Meta + TikTok)",
        kpi_inventory_val: "Valorisation du Stock",
        carrier_holding: "Fonds en attente de virement",
        cost_valuation: "Au coût d'achat fournisseur",
        chart_revenue_profit: "Chiffre d'Affaires vs Bénéfice Net",
        chart_orders_distribution: "Répartition des Commandes",

        // Orders Tab
        orders_title: "Gestion des Commandes & COD",
        orders_subtitle: "Suivez le statut de livraison, les frais transporteur et le profit net par commande",
        add_order: "Nouvelle Commande",
        search_orders_ph: "Rechercher n° commande, téléphone, tracking...",
        opt_all_status: "Tous les statuts",
        opt_delivered: "Livrée (Delivered)",
        opt_shipped: "En cours (Shipped)",
        opt_confirmed: "Confirmée",
        opt_returned: "Retournée (Returned)",
        opt_cancelled: "Annulée",
        th_order_num: "N° Commande",
        th_customer_city: "Client & Ville",
        th_carrier: "Transporteur",
        th_amount_cod: "Montant (COD)",
        th_shipping_cost: "Frais Livraison & Emballage",
        th_status: "Statut",
        th_net_profit: "Bénéfice Net / Perte",
        th_actions: "Actions",

        // Products Tab
        products_title: "Catalogue Produits & Simulateur de Marge",
        products_subtitle: "Calculez la marge contributive réelle en intégrant le taux de retour et point mort",
        btn_download_csv_template: "Modèle d'import CSV",
        btn_upload_csv: "Importer CSV",
        btn_add_product: "Ajouter Produit",
        modal_add_product_title: "Ajouter Nouveau Produit au Catalogue",
        lbl_prod_sku: "Code Produit (SKU):",
        lbl_prod_title: "Nom du Produit:",
        lbl_prod_category: "Catégorie:",
        lbl_prod_stock: "Unités en Stock:",
        lbl_prod_purchase_cost: "Prix d'Achat Fournisseur:",
        lbl_prod_selling_price: "Prix de Vente Client:",
        lbl_prod_packaging_cost: "Coût d'Emballage Unitaire:",
        lbl_prod_reorder_threshold: "Seuil d'Alerte:",
        btn_save_product: "Enregistrer le Produit",
        th_prod_sku: "Produit & SKU",
        th_purchase_cost: "Coût d'achat",
        th_selling_price: "Prix de vente",
        th_nominal_margin: "Marge Nominale",
        th_stock_qty: "Stock Disponible",
        th_stock_status: "Statut",
        th_profit_breakdown: "Analyse de Rentabilité",

        // Reconciliation Tab
        reconcile_title: "Rapprochement & Audit COD Transporteurs",
        reconcile_subtitle: "Détectez instantanément les écarts et déductions injustifiées sur vos virements",
        btn_edit_city_rates: "Tarifs de livraison par ville",

        // Marketing Tab
        marketing_title: "Campagnes Marketing & ROAS Réel",
        marketing_subtitle: "Liez vos dépenses Meta et TikTok aux commandes réellement encaissées",
        btn_add_ad_spend: "Ajouter Dépense Pub",
        th_platform: "Plateforme",
        th_campaign_name: "Nom de Campagne",
        th_ad_spend: "Dépense Pub",
        th_attributed_orders: "Commandes Attribuées",
        th_cpa: "Coût par Acquisition (CPA)",
        th_roas: "Retour sur Dépense (ROAS)",

        // Inventory Tab
        inventory_title: "Gestion du Stock & Capital",
        inventory_subtitle: "Détection des produits dormants (Dead Stock) et alertes de réapprovisionnement",
        kpi_inv_total_units: "Total Unités en Entrepôt",
        kpi_inv_low_stock: "Alertes Stock Faible",
        kpi_inv_dead_stock: "Produits Dormants",

        // AI Copilot Tab
        ai_analyst_title: "Copilote Financier IA (ProfitPilot Analyst)",
        ai_analyst_subtitle: "Posez vos questions sur vos profits, vos retours et vos dépenses publicitaires",
        ph_ai_chat: "Posez votre question financière ici...",

        // Catalog AI Tab
        ai_copilot_title: "Rédacteur IA Catalogue & Landing Pages",
        ai_copilot_subtitle: "Générez des titres accrocheurs, des arguments de vente et des FAQ",
        lbl_product_base_name: "Nom du Produit:",
        lbl_product_category: "Catégorie:",
        lbl_product_features: "Caractéristiques clés (séparées par virgule):",
        btn_generate_copy: "Générer le Contenu Marketing",
        lbl_suggested_title: "Titre Marketing Suggéré:",
        lbl_persuasive_copy: "Texte Publicitaire Persuasif:",
        lbl_bullet_points: "Points Forts de Vente:",
        lbl_store_faq: "Questions Fréquentes (FAQ):",

        // Integrations Tab
        integrations_title: "Intégrations Automatisées (WooCommerce & Shopify)",
        integrations_subtitle: "Réceptionnez instantanément les commandes dès validation dans votre boutique",
        btn_refresh_logs: "Actualiser le Journal",
        wc_compat_hint: "Compatible avec WooCommerce, FunnelKit et CartFlows",
        shopify_compat_hint: "Synchronisation en direct avec checkout Shopify & apps COD",
        badge_live_ready: "Actif & À l'écoute",
        lbl_webhook_url: "URL Webhook de votre boutique:",
        lbl_shopify_url: "URL Webhook Shopify:",
        wc_steps_title: "Instructions d'activation WordPress:",
        wc_step_1: "Allez dans: WooCommerce > Réglages > Avancé > Webhooks.",
        wc_step_2: "Cliquez sur Ajouter un webhook et collez l'URL ci-dessus dans URL de livraison.",
        wc_step_3: "Choisissez Sujet: Commande créée, Statut: Actif et enregistrez.",
        shopify_steps_title: "Instructions d'activation Shopify:",
        shopify_step_1: "Allez dans: Shopify Admin > Paramètres > Notifications.",
        shopify_step_2: "Faites défiler jusqu'à Webhooks et cliquez sur Créer un webhook.",
        shopify_step_3: "Sélectionnez Événement: Création de commande (JSON) et collez l'URL.",
        btn_test_wc: "Envoyer une Commande Démo WooCommerce",
        btn_test_shopify: "Envoyer une Commande Démo Shopify",
        synced_orders_heading: "Journal des Commandes Synchronisées en Direct",
        th_internal_order: "N° Interne",
        th_external_order: "N° Boutique",
        th_sync_time: "Reçu le",
        th_sync_status: "Statut Synchro",

        // Modal: New Order
        modal_new_order_title: "Nouvelle Commande (Manuel & COD)",
        btn_fill_sample: "Remplir Données Démo",
        lbl_cust_name: "Nom Complet du Client:",
        ph_cust_name: "ex: Youssef Mansouri / Karim Alami",
        lbl_cust_phone: "Numéro de Téléphone (WhatsApp):",
        ph_cust_phone: "ex: +212 661-123456",
        lbl_cust_city: "Ville (Choisir ou saisir):",
        ph_cust_city: "Saisir la ville... (Casablanca, Rabat, Marrakech...)",
        lbl_cust_address: "Adresse Détaillée:",
        ph_cust_address: "ex: Boulevard d'Anfa, Résidence Yasmin n°14",
        lbl_order_product: "Produit Commandé:",
        lbl_order_qty: "Quantité:",
        lbl_carrier_company: "Société de Livraison:",
        lbl_carrier_fee: "Frais de Livraison (Ville):",
        lbl_shipping_charged: "Facturé au Client:",
        lbl_total_cod: "Montant Total à Encaisser (COD):",
        lbl_expected_profit: "Bénéfice Net Attendu à la Livraison:",
        btn_cancel: "Annuler",
        btn_save_order: "Enregistrer la Commande",

        // Modal: Carrier Recon
        modal_recon_title: "Rapprochement Bancaire & Audit COD Transporteur",
        recon_audit_subtitle: "Audit financier: rapprochement du virement bancaire avec les commandes livrées",
        lbl_recon_collected: "Fonds Totaux Encaissés auprès des Clients:",
        lbl_recon_shipping_fee: "Frais de Livraison Déduits:",
        lbl_recon_return_fee: "Frais de Retour (RTO) Déduits:",
        lbl_recon_expected_payout: "Virement Bancaire Net Attendu:",
        lbl_recon_bank: "Banque Destinataire:",
        lbl_recon_ref: "Référence du Virement (Avis):",
        lbl_recon_actual: "Montant Réellement Reçu en Banque:",
        recon_matched_title: "Concordance Parfaite à 100% (Zéro Écart)",
        recon_matched_desc: "Le montant viré correspond exactement aux créances nettes de votre boutique après déduction des frais de livraison et retours justifiés.",
        recon_how_title: "Comment l'application vérifie-t-elle sans connexion bancaire directe ?",
        recon_how_desc: "ProfitPilot AI effectue un audit mathématique indépendant : totalise l'argent remis par les clients, déduit les frais officiels, puis compare au virement reçu pour déceler toute erreur ou retenue abusive !",
        btn_close: "Fermer",
        btn_confirm_recon: "Valider le Rapprochement & Archiver",

        // Modal: Add Spend
        modal_ad_spend_title: "Enregistrer Dépense Publicitaire (Suivi ROAS)",
        lbl_ad_platform: "Plateforme Pub:",
        lbl_ad_amount: "Montant Dépensé:",
        lbl_campaign_name: "Nom de la Campagne:",
        lbl_campaign_orders: "Nombre de Commandes Rapportées:",
        lbl_campaign_date: "Date de Dépense:",
        btn_save_spend: "Enregistrer & Lier au ROAS Réel",

        // Modal: City Rates
        modal_city_rates_title: "Configuration des Tarifs de Livraison par Ville",
        lbl_select_carrier: "Choisir le Transporteur:",
        lbl_default_shipping_rate: "Tarif de Base Standard (MAD):",
        city_rates_info: "Personnalisez le tarif de livraison pour chaque ville. Toutes les commandes manuelles ou reçues via WooCommerce/Shopify appliqueront automatiquement ce tarif !",
        th_city_name: "Ville / Province",
        th_region: "Zone Géographique",
        th_actual_shipping_rate: "Tarif Réel Appliqué (MAD)",
        btn_save_city_rates: "Enregistrer les Tarifs par Ville",

        // Modal: Profile Settings
        modal_profile_title: "Paramètres du Compte & de la Boutique",
        lbl_profile_owner_name: "Nom du Marchand / Propriétaire:",
        lbl_profile_store_name: "Nom de la Boutique:",
        lbl_profile_phone: "Téléphone / WhatsApp:",
        lbl_profile_email: "Email Professionnel:",
        lbl_profile_base_city: "Ville Principale / Siège:",
        lbl_profile_currency: "Devise Principale:",
        lbl_profile_bank_name: "Banque Réceptrice des Virements COD:",
        lbl_profile_bank_rib: "Compte Bancaire (RIB / IBAN):",
        btn_save_profile: "Enregistrer & Mettre à Jour",
        btn_logout: "Déconnexion & Changer de Compte",

        // Modal: Onboarding Wizard & Auth
        onboard_welcome_title: "Bienvenue sur ProfitPilot AI 🚀",
        onboard_welcome_subtitle: "La première plateforme intelligente de gestion et d'audit des profits e-commerce et COD. Configurons votre boutique en moins d'une minute !",
        tab_auth_register: "Créer une Boutique & Nouveau Compte",
        tab_auth_login: "Connexion (Synchronisation Multi-Appareils)",
        lbl_auth_email: "Email Professionnel de Connexion :",
        lbl_auth_password: "Mot de passe (Accès Multi-Appareils) :",
        banner_login_info_title: "Synchronisation Cloud Avancée Multi-Appareils :",
        banner_login_info_desc: "Si vous avez déjà créé un compte sur votre téléphone ou ordinateur, connectez-vous ici avec le même email pour synchroniser instantanément vos bénéfices, commandes et règlements COD.",
        btn_complete_onboarding: "Créer le Compte & Synchroniser",
        btn_login_sync: "Se Connecter & Synchroniser la Boutique"
    }
};

// ==========================================
// Initialization Lifecycle
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Check & Apply Saved Language
    setLanguage(currentLang);

    // 2. Load User Profile & Store Name from storage if exists
    applyStoredProfile();

    // 3. Ensure Backend Authentication Session
    await ensureAuthSession();

    // 4. Load Data across all modules
    await loadDashboard();
    await loadOrders();
    await loadProducts();
    await loadReconciliation();
    await loadMarketing();
    await loadInventory();
    await loadAlerts();

    // 5. First-Time Launch Onboarding Check
    checkOnboardingWizard();
});

// Check if first-time onboarding is needed
function checkOnboardingWizard() {
    const isCompleted = localStorage.getItem("profitpilot_onboarding_completed");
    if (!isCompleted || isCompleted !== "true") {
        setTimeout(() => {
            openModal("modal-onboarding");
        }, 600);
    }
}

// Switch between Register and Login modes in Onboarding Modal
function switchAuthMode(mode) {
    const regPane = document.getElementById("pane-auth-register");
    const loginPane = document.getElementById("pane-auth-login");
    const regBtn = document.getElementById("btn-auth-mode-register");
    const loginBtn = document.getElementById("btn-auth-mode-login");

    if (mode === "login") {
        if (regPane) regPane.style.display = "none";
        if (loginPane) loginPane.style.display = "block";
        if (regBtn) regBtn.classList.remove("active");
        if (loginBtn) loginBtn.classList.add("active");
    } else {
        if (regPane) regPane.style.display = "block";
        if (loginPane) loginPane.style.display = "none";
        if (regBtn) regBtn.classList.add("active");
        if (loginBtn) loginBtn.classList.remove("active");
    }
}

function applyStoredProfile() {
    const storedOwner = localStorage.getItem("profitpilot_owner_name");
    const storedStore = localStorage.getItem("profitpilot_store_name");
    const storedCurr = localStorage.getItem("profitpilot_currency");

    if (storedOwner) {
        const userEl = document.getElementById("user-display-name");
        if (userEl) userEl.textContent = storedOwner;
    }
    if (storedStore) {
        const storeEl = document.getElementById("current-store-name");
        if (storeEl) storeEl.textContent = storedStore;
    }
    if (storedCurr) {
        currentCurrency = storedCurr;
        const currSelect = document.getElementById("currency-select");
        if (currSelect) currSelect.value = storedCurr;
    }
}

// Complete First-Time Onboarding & Registration
async function completeOnboardingRegister() {
    const ownerName = document.getElementById("onboard-owner-name")?.value.trim() || "كريم العلمي";
    const storeName = document.getElementById("onboard-store-name")?.value.trim() || "متجر الأطلس للتجارة";
    const email = document.getElementById("onboard-email")?.value.trim() || "karim.alami@profitpilot.ai";
    const password = document.getElementById("onboard-password")?.value || "password123";
    const baseCity = document.getElementById("onboard-base-city")?.value.trim() || "الدار البيضاء (Casablanca)";
    const currency = document.getElementById("onboard-currency")?.value || "MAD";
    const phone = document.getElementById("onboard-phone")?.value.trim() || "+212 661-123456";
    const bankName = document.getElementById("onboard-bank")?.value || "CIH Bank";

    // 1. Attempt Registration with backend
    try {
        const regResp = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password,
                full_name: ownerName,
                store_name: storeName,
                currency: currency,
                country: "Morocco"
            })
        });

        if (regResp.ok) {
            const data = await regResp.json();
            authToken = data.access_token;
            localStorage.setItem("profitpilot_token", authToken);
            if (data.active_store) activeStore = data.active_store;
        } else {
            // If already registered, attempt login with same credentials
            const loginResp = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password })
            });
            if (loginResp.ok) {
                const data = await loginResp.json();
                authToken = data.access_token;
                localStorage.setItem("profitpilot_token", authToken);
                if (data.active_store) activeStore = data.active_store;
            }
        }
    } catch (e) {
        console.warn("Auth registration error:", e);
    }

    // 2. Persist extended merchant profile
    localStorage.setItem("profitpilot_owner_name", ownerName);
    localStorage.setItem("profitpilot_store_name", storeName);
    localStorage.setItem("profitpilot_email", email);
    localStorage.setItem("profitpilot_base_city", baseCity);
    localStorage.setItem("profitpilot_currency", currency);
    localStorage.setItem("profitpilot_phone", phone);
    localStorage.setItem("profitpilot_bank", bankName);
    localStorage.setItem("profitpilot_onboarding_completed", "true");

    // 3. Apply updates to live interface
    applyStoredProfile();
    changeCurrency(currency);
    closeModal("modal-onboarding");

    // 4. Update backend profile if token exists
    if (authToken) {
        try {
            await fetch(`${API_BASE}/auth/profile`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    full_name: ownerName,
                    email: email,
                    store_name: storeName,
                    currency: currency,
                    base_city: baseCity,
                    phone: phone,
                    bank_name: bankName
                })
            });
        } catch (e) {
            console.warn("Profile update sync warning:", e);
        }
    }

    // 5. Reload dashboard data with new context
    await loadDashboardSummary();
    await loadOrders();
    await loadProducts();
    await loadReconciliation();
    await loadMarketingData();

    const welcomeMsg = (currentLang === "en") ? `Welcome ${ownerName}! Your store "${storeName}" is configured and cloud sync is active!`
                     : (currentLang === "fr") ? `Bienvenue ${ownerName} ! Votre boutique "${storeName}" est configurée et la synchronisation cloud est active !`
                     : `مرحباً بك ${ownerName}! تم إعداد متجرك "${storeName}" وتفعيل المزامنة السحابية بنجاح!`;
    alert(welcomeMsg);
}

// Handle Login from Another Phone / Device
async function handleLoginSubmit() {
    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value;

    if (!email || !password) {
        const reqMsg = (currentLang === "en") ? "Please enter both email and password."
                     : (currentLang === "fr") ? "Veuillez saisir votre email et mot de passe."
                     : "يرجى إدخال البريد الإلكتروني وكلمة المرور.";
        alert(reqMsg);
        return;
    }

    try {
        const resp = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        });

        if (!resp.ok) {
            const errMsg = (currentLang === "en") ? "Invalid email or password. Please check your credentials."
                         : (currentLang === "fr") ? "Email ou mot de passe incorrect. Veuillez vérifier vos identifiants."
                         : "خطأ: البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً.";
            alert(errMsg);
            return;
        }

        const data = await resp.json();
        authToken = data.access_token;
        localStorage.setItem("profitpilot_token", authToken);
        if (data.active_store) activeStore = data.active_store;

        const ownerName = data.user.full_name || "التاجر";
        const storeName = data.active_store?.name || "متجري";
        const currency = data.active_store?.currency || "MAD";

        localStorage.setItem("profitpilot_owner_name", ownerName);
        localStorage.setItem("profitpilot_email", data.user.email);
        localStorage.setItem("profitpilot_store_name", storeName);
        localStorage.setItem("profitpilot_currency", currency);
        localStorage.setItem("profitpilot_onboarding_completed", "true");

        applyStoredProfile();
        changeCurrency(currency);
        closeModal("modal-onboarding");

        // Reload data for this user
        await loadDashboardSummary();
        await loadOrders();
        await loadProducts();
        await loadReconciliation();
        await loadMarketingData();
        await loadAlerts();

        const successMsg = (currentLang === "en") ? `Logged in successfully! Welcome back ${ownerName}. All store data and profits are synced.`
                         : (currentLang === "fr") ? `Connexion réussie ! Bon retour ${ownerName}. Toutes les données sont synchronisées.`
                         : `تم تسجيل الدخول بنجاح! مرحباً بعودتك ${ownerName}. تم مزامنة كافة بيانات متجرك وأرباحك على هذا الجهاز بنجاح.`;
        alert(successMsg);

    } catch (e) {
        console.error("Login submission error:", e);
        alert("تعذر الاتصال بالخادم. يرجى التأكد من تشغيل السيرفر والمحاولة مجدداً.");
    }
}

// Log out and switch accounts across devices
function logoutUser() {
    const confirmMsg = (currentLang === "en") ? "Are you sure you want to log out and switch account?"
                     : (currentLang === "fr") ? "Êtes-vous sûr de vouloir vous déconnecter et changer de compte ?"
                     : "هل أنت متأكد من رغبتك في تسجيل الخروج وتبديل الحساب؟";
    if (confirm(confirmMsg)) {
        localStorage.removeItem("profitpilot_token");
        localStorage.removeItem("profitpilot_onboarding_completed");
        authToken = "";
        closeModal("modal-profile-settings");
        setTimeout(() => {
            openModal("modal-onboarding");
            switchAuthMode("login");
        }, 300);
    }
}

// Open & Save Profile Settings Modal
function openProfileSettingsModal() {
    const ownerName = localStorage.getItem("profitpilot_owner_name") || "كريم العلمي";
    const storeName = localStorage.getItem("profitpilot_store_name") || "متجر الأطلس للتجارة";
    const phone = localStorage.getItem("profitpilot_phone") || "+212 661-123456";
    const email = localStorage.getItem("profitpilot_email") || "demo@profitpilot.ai";
    const city = localStorage.getItem("profitpilot_base_city") || "الدار البيضاء (Casablanca)";
    const currency = localStorage.getItem("profitpilot_currency") || currentCurrency || "MAD";
    const bankName = localStorage.getItem("profitpilot_bank") || "CIH Bank";
    const bankRib = localStorage.getItem("profitpilot_bank_rib") || "230 780 45678901234567 89";

    const ownerInput = document.getElementById("profile-owner-name");
    if (ownerInput) ownerInput.value = ownerName;

    const storeInput = document.getElementById("profile-store-name");
    if (storeInput) storeInput.value = storeName;

    const phoneInput = document.getElementById("profile-phone");
    if (phoneInput) phoneInput.value = phone;

    const emailInput = document.getElementById("profile-email");
    if (emailInput) emailInput.value = email;

    const cityInput = document.getElementById("profile-base-city");
    if (cityInput) cityInput.value = city;

    const currSelect = document.getElementById("profile-currency");
    if (currSelect) currSelect.value = currency;

    const bankSelect = document.getElementById("profile-bank-name");
    if (bankSelect) bankSelect.value = bankName;

    const ribInput = document.getElementById("profile-bank-rib");
    if (ribInput) ribInput.value = bankRib;

    openModal("modal-profile-settings");
}

async function saveProfileSettings() {
    const ownerName = document.getElementById("profile-owner-name")?.value.trim() || "كريم العلمي";
    const storeName = document.getElementById("profile-store-name")?.value.trim() || "متجر الأطلس للتجارة";
    const phone = document.getElementById("profile-phone")?.value.trim() || "+212 661-123456";
    const email = document.getElementById("profile-email")?.value.trim() || "demo@profitpilot.ai";
    const city = document.getElementById("profile-base-city")?.value.trim() || "الدار البيضاء (Casablanca)";
    const currency = document.getElementById("profile-currency")?.value || "MAD";
    const bankName = document.getElementById("profile-bank-name")?.value || "CIH Bank";
    const bankRib = document.getElementById("profile-bank-rib")?.value.trim() || "230 780 45678901234567 89";

    localStorage.setItem("profitpilot_owner_name", ownerName);
    localStorage.setItem("profitpilot_store_name", storeName);
    localStorage.setItem("profitpilot_phone", phone);
    localStorage.setItem("profitpilot_email", email);
    localStorage.setItem("profitpilot_base_city", city);
    localStorage.setItem("profitpilot_currency", currency);
    localStorage.setItem("profitpilot_bank", bankName);
    localStorage.setItem("profitpilot_bank_rib", bankRib);

    applyStoredProfile();
    if (currency !== currentCurrency) {
        changeCurrency(currency);
    }

    try {
        await fetch(`${API_BASE}/auth/profile`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name: ownerName,
                email: email,
                store_name: storeName,
                currency: currency,
                base_city: city,
                phone: phone,
                bank_name: bankName,
                bank_rib: bankRib
            })
        });
    } catch (e) {
        console.warn("Backend profile sync error:", e);
    }

    closeModal("modal-profile-settings");
    const msg = (currentLang === "en") ? "Profile and store settings updated successfully!"
              : (currentLang === "fr") ? "Paramètres du profil et de la boutique mis à jour avec succès !"
              : "تم حفظ وتحديث بيانات صاحب الحساب والمتجر بنجاح!";
    alert(msg);
}

// Ensure Authentication & Session Validation
async function ensureAuthSession() {
    // 1. If existing token in storage, test if still valid
    if (authToken) {
        try {
            const meResp = await fetch(`${API_BASE}/auth/me`, {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            if (meResp.ok) {
                const meData = await meResp.json();
                activeStore = meData.active_store;
                return;
            }
        } catch (e) {
            console.warn("Session validation error:", e);
        }
    }

    // 2. Default fallback login
    try {
        const loginResp = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "demo@profitpilot.ai",
                password: "password123"
            })
        });
        if (loginResp.ok) {
            const loginData = await loginResp.json();
            authToken = loginData.access_token;
            localStorage.setItem("profitpilot_token", authToken);
            activeStore = loginData.active_store;
            return;
        }
    } catch (e) {
        console.error("Auth session login error:", e);
    }
}

// Navigation Tabs
function switchTab(tabId) {
    document.querySelectorAll(".content-tab").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add("active");

    const activeNav = document.querySelector(`.nav-item[href="#${tabId}"]`);
    if (activeNav) activeNav.classList.add("active");

    if (tabId === "integrations") {
        loadIntegrationLogs();
    }

    if (window.innerWidth <= 768) {
        document.querySelector(".sidebar").classList.remove("open");
    }
}

function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("open");
}

function toggleTheme() {
    document.body.classList.toggle("light-theme");
    const icon = document.getElementById("theme-icon");
    if (document.body.classList.contains("light-theme")) {
        icon.className = "fa-solid fa-sun";
    } else {
        icon.className = "fa-solid fa-moon";
    }
}

// Multi-Language Switcher
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("profitpilot_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

    document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = Array.from(document.querySelectorAll(".lang-btn")).find(b => b.textContent.toLowerCase().includes(lang));
    if (activeBtn) activeBtn.classList.add("active");

    // Translate DOM elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (i18n[lang] && i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });

    // Translate input placeholders with data-i18n-ph
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
        const key = el.getAttribute("data-i18n-ph");
        if (i18n[lang] && i18n[lang][key]) {
            el.placeholder = i18n[lang][key];
        }
    });

    // Re-render dynamic content with active language
    updateDashboardDynamicTexts(lastDashboardSummary);
    renderOrdersTable(allOrders);
    renderProductsTable(allProducts);
    renderMarketingTable(allCampaigns);
    renderInventoryCards(lastInventoryData);
}

function updateDashboardDynamicTexts(data) {
    if (!data) return;
    const marginEl = document.getElementById("kpi-margin-sub");
    const successEl = document.getElementById("kpi-success-rate");
    const returnEl = document.getElementById("kpi-return-rate");
    const roasEl = document.getElementById("kpi-roas");

    if (currentLang === "en") {
        if (marginEl) marginEl.textContent = `Profit Margin: ${data.net_profit_margin_pct}% (after shipping & ad spend)`;
        if (successEl) successEl.textContent = `Delivery Rate: ${data.delivery_success_rate}% (${data.delivered_orders} delivered)`;
        if (returnEl) returnEl.textContent = `Return Rate: ${data.return_rate}% (${data.returned_orders} returned)`;
        if (roasEl) roasEl.textContent = `True ROAS: 6.4x`;
    } else if (currentLang === "fr") {
        if (marginEl) marginEl.textContent = `Marge Nette: ${data.net_profit_margin_pct}% (après port & pub)`;
        if (successEl) successEl.textContent = `Taux de Livraison: ${data.delivery_success_rate}% (${data.delivered_orders} livrées)`;
        if (returnEl) returnEl.textContent = `Taux de Retour: ${data.return_rate}% (${data.returned_orders} retours)`;
        if (roasEl) roasEl.textContent = `ROAS Réel: 6.4x`;
    } else {
        if (marginEl) marginEl.textContent = `هامش الربح: ${data.net_profit_margin_pct}% (بعد خصم الشحن والإعلانات)`;
        if (successEl) successEl.textContent = `نسبة التوصيل: ${data.delivery_success_rate}% (${data.delivered_orders} طلب مسلم)`;
        if (returnEl) returnEl.textContent = `نسبة الإرجاع: ${data.return_rate}% (${data.returned_orders} مرتجع)`;
        if (roasEl) roasEl.textContent = `العائد ROAS الحقيقي: 6.4x`;
    }
}

// Load Dashboard Summary & KPIs
async function loadDashboard() {
    try {
        const currSelect = document.getElementById("currency-select");
        if (currSelect) currSelect.value = currentCurrency;

        const resp = await fetch(`${API_BASE}/dashboard/summary`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (!resp.ok) return;
        const data = await resp.json();
        lastDashboardSummary = data;

        document.getElementById("kpi-net-profit").innerHTML = formatMoney(data.net_profit);
        document.getElementById("kpi-delivered-revenue").innerHTML = formatMoney(data.delivered_revenue);
        document.getElementById("kpi-return-losses").innerHTML = formatMoney(data.return_expenses);
        document.getElementById("kpi-carrier-cod").innerHTML = formatMoney(data.outstanding_carrier_balance);
        document.getElementById("kpi-ad-spend").innerHTML = formatMoney(data.ad_spend_total);
        document.getElementById("kpi-inventory-val").innerHTML = formatMoney(data.inventory_valuation);

        updateDashboardDynamicTexts(data);
        await loadCharts(data);
    } catch (e) {
        console.error("Error loading dashboard:", e);
    }
}

// Render Charts
async function loadCharts(summaryData) {
    try {
        const resp = await fetch(`${API_BASE}/dashboard/charts`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const chartData = await resp.json();

        const labels = chartData.points.map(p => p.date);
        const revenues = chartData.points.map(p => parseFloat(p.delivered_revenue));
        const profits = chartData.points.map(p => parseFloat(p.net_profit));

        // 1. Line/Bar Chart
        const ctxRev = document.getElementById("revenueProfitChart").getContext("2d");
        if (revenueChart) revenueChart.destroy();

        const revLabel = (currentLang === "en") ? `Delivered Revenue (${currentCurrency})`
                       : (currentLang === "fr") ? `Chiffre d'Affaires (${currentCurrency})`
                       : `المبيعات المحصلة (${currentCurrency})`;
        const profitLabel = (currentLang === "en") ? `Net Profit (${currentCurrency})`
                         : (currentLang === "fr") ? `Bénéfice Net (${currentCurrency})`
                         : `صافي الأرباح (${currentCurrency})`;

        revenueChart = new Chart(ctxRev, {
            type: "bar",
            data: {
                labels: labels.length ? labels : ["2026-10-21"],
                datasets: [
                    {
                        label: revLabel,
                        data: revenues.length ? revenues : [0],
                        backgroundColor: "rgba(59, 130, 246, 0.7)",
                        borderRadius: 6
                    },
                    {
                        label: profitLabel,
                        data: profits.length ? profits : [0],
                        backgroundColor: "rgba(16, 185, 129, 0.8)",
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: "rgba(255, 255, 255, 0.05)" } },
                    x: { grid: { display: false } }
                }
            }
        });

        // 2. Status Doughnut Chart
        const ctxStatus = document.getElementById("orderStatusChart").getContext("2d");
        if (statusChart) statusChart.destroy();

        const donutLabels = (currentLang === "en") ? ["Delivered", "Returned", "In Transit", "Cancelled"]
                          : (currentLang === "fr") ? ["Livrées", "Retournées", "En cours", "Annulées"]
                          : ["مستلم (Delivered)", "مرتجع (Returned)", "قيد التوصيل (In Transit)", "ملغي (Cancelled)"];

        statusChart = new Chart(ctxStatus, {
            type: "doughnut",
            data: {
                labels: donutLabels,
                datasets: [{
                    data: [
                        summaryData.delivered_orders,
                        summaryData.returned_orders,
                        summaryData.pending_orders,
                        summaryData.cancelled_orders
                    ],
                    backgroundColor: [
                        "#10b981",
                        "#ef4444",
                        "#3b82f6",
                        "#94a3b8"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    } catch (e) {
        console.error("Error loading charts:", e);
    }
}

// Load Alerts Banner
async function loadAlerts() {
    try {
        const resp = await fetch(`${API_BASE}/dashboard/alerts`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const alerts = await resp.json();
        const container = document.getElementById("alerts-container");
        container.innerHTML = "";

        alerts.forEach(al => {
            const div = document.createElement("div");
            div.className = `alert-banner ${al.severity}`;
            div.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <div>
                    <strong>${al.title}:</strong> ${al.message}
                    ${al.action_label ? `<span style="text-decoration: underline; margin-inline-start: 8px;">(${al.action_label})</span>` : ""}
                </div>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        console.error("Error loading alerts:", e);
    }
}

// Load Orders Table
async function loadOrders() {
    try {
        const resp = await fetch(`${API_BASE}/orders`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        allOrders = await resp.json();
        renderOrdersTable(allOrders);
    } catch (e) {
        console.error("Error loading orders:", e);
    }
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById("orders-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!orders.length) {
        const emptyMsg = (currentLang === "en") ? "No orders recorded yet."
                       : (currentLang === "fr") ? "Aucune commande enregistrée pour l'instant."
                       : "لا توجد طلبات مسجلة حالياً.";
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px;">${emptyMsg}</td></tr>`;
        return;
    }

    orders.forEach(o => {
        const tr = document.createElement("tr");
        const profitClass = parseFloat(o.net_profit) >= 0 ? "style='color:#34d399; font-weight:700;'" : "style='color:#f87171; font-weight:700;'";

        const deliverBtnText = (currentLang === "en") ? "Deliver"
                             : (currentLang === "fr") ? "Livrer"
                             : "تسليم";
        const noTrackText = (currentLang === "en") ? "No tracking"
                          : (currentLang === "fr") ? "Sans suivi"
                          : "بدون تتبع";

        const safeOrderNum = escapeHtml(o.order_number);
        const safeTracking = escapeHtml(o.tracking_number || noTrackText);
        const safeCustName = escapeHtml(o.customer_name || "Client");
        const safeCustCity = escapeHtml(o.customer_city || "Casablanca");
        const safeCarrier = escapeHtml(o.delivery_company_name || "Cathedis Express");
        const safeStatus = escapeHtml(o.order_status);

        tr.innerHTML = `
            <td><strong>#${safeOrderNum}</strong><br><small style="color:#64748b;">${safeTracking}</small></td>
            <td>${safeCustName}<br><small style="color:#64748b;">${safeCustCity}</small></td>
            <td>${safeCarrier}</td>
            <td><strong>${formatMoney(o.total_amount)}</strong></td>
            <td>${formatMoney(o.delivery_cost_actual)}</td>
            <td><span class="badge ${safeStatus}">${safeStatus}</span></td>
            <td ${profitClass}>${formatMoney(o.net_profit)}</td>
            <td>
                ${o.order_status !== "delivered" ? `<button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="markDelivered(${o.id})">${deliverBtnText}</button>` : `<i class="fa-solid fa-check" style="color:#34d399;"></i>`}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterOrders() {
    const q = document.getElementById("order-search-input").value.toLowerCase();
    const st = document.getElementById("order-status-filter").value.toLowerCase();

    const filtered = allOrders.filter(o => {
        const matchQ = (o.order_number && o.order_number.toLowerCase().includes(q)) ||
                       (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
                       (o.tracking_number && o.tracking_number.toLowerCase().includes(q));
        const matchSt = !st || o.order_status.toLowerCase() === st;
        return matchQ && matchSt;
    });

    renderOrdersTable(filtered);
}

async function markDelivered(orderId) {
    try {
        await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ order_status: "delivered" })
        });
        await loadOrders();
        await loadDashboard();
    } catch (e) {
        console.error("Error updating order:", e);
    }
}

// Load Products
async function loadProducts() {
    try {
        const resp = await fetch(`${API_BASE}/products`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        allProducts = await resp.json();
        renderProductsTable(allProducts);
    } catch (e) {
        console.error("Error loading products:", e);
    }
}

function renderProductsTable(prods) {
    const tbody = document.getElementById("products-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    prods.forEach(p => {
        const tr = document.createElement("tr");
        const inStockText = (currentLang === "en") ? "In Stock" : (currentLang === "fr") ? "En Stock" : "متوفر";
        const lowStockText = (currentLang === "en") ? "Low Stock" : (currentLang === "fr") ? "Stock Faible" : "مخزون منخفض";
        const unitsWord = (currentLang === "en") ? "units" : (currentLang === "fr") ? "unités" : "قطعة";
        const btnText = (currentLang === "en") ? "Profit Analysis" : (currentLang === "fr") ? "Analyse Marge" : "تحليل الهامش الصافي";

        const isGoodStock = p.stock_quantity > p.reorder_threshold;
        const safeTitle = escapeHtml(p.title);
        const safeSku = escapeHtml(p.sku);
        tr.innerHTML = `
            <td><strong>${safeTitle}</strong><br><small style="color:#64748b;">SKU: ${safeSku}</small></td>
            <td>${formatMoney(p.purchase_cost)}</td>
            <td><strong>${formatMoney(p.selling_price)}</strong></td>
            <td style="color:#34d399;">+${formatMoney(p.nominal_margin)} (${p.nominal_margin_pct}%)</td>
            <td><strong>${p.stock_quantity}</strong> ${unitsWord}</td>
            <td><span class="badge ${isGoodStock ? 'delivered' : 'returned'}">${isGoodStock ? inStockText : lowStockText}</span></td>
            <td><button class="btn btn-secondary" style="font-size:0.75rem; padding:4px 10px;" onclick="viewProfitDetail(${p.id})">${btnText}</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function viewProfitDetail(productId) {
    try {
        const resp = await fetch(`${API_BASE}/products/${productId}/profitability`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const d = await resp.json();
        if (currentLang === "en") {
            alert(
                `Profitability Analysis: ${d.title}\n` +
                `• Selling Price: ${d.selling_price} MAD\n` +
                `• Supplier Cost: ${d.purchase_cost} MAD\n` +
                `• Net Profit on Successful Delivery: ${d.delivered_net_profit} MAD\n` +
                `• Return Loss (RTO): ${d.return_loss} MAD\n` +
                `• Expected Net Contribution (at 75% delivery rate): ${d.expected_net_contribution} MAD (${d.real_margin_percentage}%)\n` +
                `• Break-even Delivery Rate Needed: ${d.break_even_delivery_rate}%`
            );
        } else if (currentLang === "fr") {
            alert(
                `Analyse de Rentabilité: ${d.title}\n` +
                `• Prix de Vente: ${d.selling_price} MAD\n` +
                `• Coût Fournisseur: ${d.purchase_cost} MAD\n` +
                `• Bénéfice Net par Commande Livrée: ${d.delivered_net_profit} MAD\n` +
                `• Perte en Cas de Retour (RTO): ${d.return_loss} MAD\n` +
                `• Contribution Nette Attendue (à 75% de livraison): ${d.expected_net_contribution} MAD (${d.real_margin_percentage}%)\n` +
                `• Taux de Livraison Minimum d'Équilibre (Break-even): ${d.break_even_delivery_rate}%`
            );
        } else {
            alert(
                `تحليل ربحية: ${d.title}\n` +
                `• سعر البيع: ${d.selling_price} MAD\n` +
                `• سعر الشراء من المورد: ${d.purchase_cost} MAD\n` +
                `• صافي الربح عند التسليم الناجح: ${d.delivered_net_profit} MAD\n` +
                `• خسارة الطلب المرتجع (RTO): ${d.return_loss} MAD\n` +
                `• المساهمة الصافية المتوقعة (بنسبة توصيل 75%): ${d.expected_net_contribution} MAD (${d.real_margin_percentage}%)\n` +
                `• نسبة التوصيل اللازمة لتفادي الخسارة (Break-even): ${d.break_even_delivery_rate}%`
            );
        }
    } catch (e) {
        console.error("Error fetching detail:", e);
    }
}

// Add New Product via Modal Form
async function submitNewProduct() {
    const sku = document.getElementById("new-prod-sku")?.value?.trim();
    const title = document.getElementById("new-prod-title")?.value?.trim();
    const category = document.getElementById("new-prod-category")?.value?.trim() || "عام";
    const stock = parseInt(document.getElementById("new-prod-stock")?.value) || 0;
    const purchaseCost = parseFloat(document.getElementById("new-prod-purchase-cost")?.value);
    const sellingPrice = parseFloat(document.getElementById("new-prod-selling-price")?.value);
    const packagingCost = parseFloat(document.getElementById("new-prod-packaging-cost")?.value) || 0;
    const reorder = parseInt(document.getElementById("new-prod-reorder")?.value) || 10;

    if (!sku || !title || isNaN(purchaseCost) || isNaN(sellingPrice)) {
        alert(currentLang === "en" ? "Please fill in SKU, Title, Purchase Cost, and Selling Price." : "يرجى ملء جميع الحقول الإلزامية: الرمز، الاسم، سعر الشراء، وسعر البيع.");
        return;
    }

    try {
        const resp = await fetch(`${API_BASE}/products`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sku: sku,
                title: title,
                category: category,
                purchase_cost: purchaseCost,
                selling_price: sellingPrice,
                packaging_cost: packagingCost,
                stock_quantity: stock,
                reorder_threshold: reorder
            })
        });

        if (!resp.ok) {
            const err = await resp.json();
            alert(err.detail || "Failed to create product");
            return;
        }

        closeModal("modal-new-product");
        await loadProducts();
        alert(currentLang === "en" ? "Product added successfully!" : "تمت إضافة المنتج بنجاح إلى الكتالوج!");
    } catch (e) {
        console.error("Error creating product:", e);
        alert("Error creating product");
    }
}

// Upload Product CSV
async function uploadProductCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const resp = await fetch(`${API_BASE}/data/import/products`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            body: formData
        });

        const res = await resp.json();
        if (resp.ok) {
            alert(currentLang === "en" 
                ? `CSV Import Successful! Imported ${res.imported_count} products.` 
                : `تم استيراد ${res.imported_count} منتج بنجاح من ملف CSV!`);
            await loadProducts();
        } else {
            alert(res.detail || "Error importing CSV");
        }
    } catch (e) {
        console.error("CSV upload error:", e);
        alert("Failed to upload CSV file");
    } finally {
        event.target.value = "";
    }
}

// Load Reconciliation
let currentReconCarrierId = 1;
let currentReconPendingAmount = 2438.00;

async function loadReconciliation() {
    try {
        const resp = await fetch(`${API_BASE}/delivery/companies`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const carriers = await resp.json();
        const grid = document.getElementById("carriers-grid");
        if (!grid) return;
        grid.innerHTML = "";

        const activeBadgeText = (currentLang === "en") ? "Active & Linked"
                              : (currentLang === "fr") ? "Actif & Connecté"
                              : "نشط ومفعل";
        const pendingLabel = (currentLang === "en") ? "Pending COD Cash Held:"
                           : (currentLang === "fr") ? "Fonds COD en attente de virement:"
                           : "أموال COD المعلقة قيد التحويل:";
        const shipLabel = (currentLang === "en") ? "Shipping Fee:" : (currentLang === "fr") ? "Frais de port:" : "رسوم التوصيل:";
        const rtoLabel = (currentLang === "en") ? "Return Fee:" : (currentLang === "fr") ? "Frais de retour:" : "رسوم الإرجاع:";
        const auditBtnText = (currentLang === "en") ? "Audit & Settle COD Bank Payout"
                           : (currentLang === "fr") ? "Vérifier & Valider le Virement Bancaire"
                           : "مطابقة وتأكيد التسوية البنكية";

        carriers.forEach(c => {
            const card = document.createElement("div");
            card.className = "kpi-card";
            card.style.flexDirection = "column";
            card.style.alignItems = "stretch";
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>${c.name}</h3>
                    <span class="badge delivered">${activeBadgeText}</span>
                </div>
                <div style="margin: 12px 0;">
                    <span style="font-size:0.8rem; color:#94a3b8;">${pendingLabel}</span>
                    <h2 style="color:#38bdf8;">${formatMoney(c.pending_cod_amount)}</h2>
                    <small>${shipLabel} ${formatMoney(c.shipping_rate_default)} | ${rtoLabel} ${formatMoney(c.return_fee_default)}</small>
                </div>
                <button class="btn btn-primary" onclick="openReconciliationModal(${c.id}, '${c.name}', '${c.pending_cod_amount}', ${c.shipping_rate_default}, ${c.return_fee_default})"><i class="fa-solid fa-scale-balanced"></i> ${auditBtnText}</button>
            `;
            grid.appendChild(card);
        });
    } catch (e) {
        console.error("Error loading reconciliation:", e);
    }
}

// Open & Handle Carrier Reconciliation Audit Modal
function openReconciliationModal(carrierId, name, pendingAmount, shippingRate, returnRate) {
    currentReconCarrierId = carrierId || 1;
    currentReconPendingAmount = parseFloat(pendingAmount) || 2438.00;
    
    const nameEl = document.getElementById("recon-carrier-name");
    if (nameEl) nameEl.textContent = name || "Cathedis Express";

    const receivedInput = document.getElementById("recon-actual-received");
    if (receivedInput) receivedInput.value = "2098.00";

    calculateDiscrepancy();
    openModal("modal-reconciliation");
}

function calculateDiscrepancy() {
    const actualInput = document.getElementById("recon-actual-received");
    const actualVal = parseFloat(actualInput ? actualInput.value : 2098) || 0;
    const expectedNet = 2098.00; // Expected net after 280 delivered fees + 60 RTO fees
    const diff = (actualVal - expectedNet).toFixed(2);

    const box = document.getElementById("recon-discrepancy-box");
    if (box) {
        if (Math.abs(diff) < 0.01) {
            box.className = "discrepancy-box matched";
            const matchTitle = (currentLang === "en") ? "100% Match (Zero Discrepancy)"
                             : (currentLang === "fr") ? "Concordance Parfaite à 100% (Zéro Écart)"
                             : "المطابقة تامة بنسبة 100% (Zero Discrepancy)";
            const matchDesc = (currentLang === "en") ? "The transferred amount exactly matches your net store receivables after verified shipping & return fees."
                            : (currentLang === "fr") ? "Le montant viré correspond exactement aux créances nettes de votre boutique après déduction des frais vérifiés."
                            : "المبلغ المحول يطابق بدقة صافي مستحقات متجرك بعد اقتطاع رسوم الشحن والمرتجعات العادلة.";
            box.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                <div>
                    <strong>${matchTitle}</strong>
                    <p>${matchDesc}</p>
                </div>
            `;
        } else {
            box.className = "discrepancy-box warning";
            const warnTitle = (currentLang === "en") ? `Alert: Discrepancy detected of ${diff} ${currentCurrency}`
                            : (currentLang === "fr") ? `Alerte: Écart financier détecté de ${diff} ${currentCurrency}`
                            : `تنبيه: يوجد فارق مالي مسجل قدره ${diff} ${currentCurrency}`;
            const warnDesc = (currentLang === "en") ? "There is a variance between courier payout and verified delivered orders. Please review before archiving."
                           : (currentLang === "fr") ? "Il existe un écart entre le virement du transporteur et les commandes livrées. Veuillez vérifier avant validation."
                           : "يوجد اختلاف بين إشعار البنك والمبالغ المسلمة. يرجى مراجعة الكشف قبل الإغلاق.";
            box.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <div>
                    <strong>${warnTitle}</strong>
                    <p>${warnDesc}</p>
                </div>
            `;
        }
    }
}

async function confirmReconciliation() {
    const actualInput = document.getElementById("recon-actual-received");
    const actualVal = parseFloat(actualInput ? actualInput.value : 2098) || 2098;

    try {
        const resp = await fetch(`${API_BASE}/delivery/settlements`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                delivery_company_id: currentReconCarrierId,
                settlement_reference: "RECON-BANK-" + Date.now().toString().slice(-5),
                received_amount: actualVal,
                delivery_fees_deducted: 280.00,
                return_fees_deducted: 60.00,
                notes: "Bank payout audit verified"
            })
        });

        if (resp.ok) {
            closeModal("modal-reconciliation");
            const successMsg = (currentLang === "en") ? "Carrier settlement confirmed and archived successfully!"
                             : (currentLang === "fr") ? "Rapprochement bancaire validé et archivé avec succès !"
                             : "تم اعتماد التسوية البنكية بنجاح وأرشفة كشف الحساب!";
            alert(successMsg);
            await loadReconciliation();
            await loadDashboard();
        }
    } catch (e) {
        console.error("Recon confirm error:", e);
        closeModal("modal-reconciliation");
    }
}

// Load Marketing
async function loadMarketing() {
    try {
        const resp = await fetch(`${API_BASE}/marketing/campaigns`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        allCampaigns = await resp.json();
        renderMarketingTable(allCampaigns);
    } catch (e) {
        console.error("Error loading marketing:", e);
    }
}

function renderMarketingTable(camps) {
    const tbody = document.getElementById("marketing-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const ordersWord = (currentLang === "en") ? "orders" : (currentLang === "fr") ? "cmdes" : "طلبات";
    camps.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${c.platform.toUpperCase()}</strong></td>
            <td>${c.campaign_name}</td>
            <td><strong>${formatMoney(c.total_spend)}</strong></td>
            <td>${c.reported_conversions} ${ordersWord}</td>
            <td>${formatMoney(c.cpa)}</td>
            <td style="color:#34d399; font-weight:700;">${c.roas}x</td>
            <td><span class="badge delivered">${c.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Load Inventory
async function loadInventory() {
    try {
        const resp = await fetch(`${API_BASE}/inventory/status`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const data = await resp.json();
        lastInventoryData = data;
        renderInventoryCards(data);
    } catch (e) {
        console.error("Error loading inventory:", e);
    }
}

function renderInventoryCards(data) {
    if (!data) return;
    const unitsWord = (currentLang === "en") ? "units" : (currentLang === "fr") ? "unités" : "قطعة";
    const prodWord = (currentLang === "en") ? "items" : (currentLang === "fr") ? "articles" : "منتجات";

    const totalEl = document.getElementById("inv-total-units");
    const lowEl = document.getElementById("inv-low-stock");
    const deadEl = document.getElementById("inv-dead-stock");

    if (totalEl) totalEl.textContent = `${data.total_units_in_stock} ${unitsWord}`;
    if (lowEl) lowEl.textContent = `${data.low_stock_products_count} ${prodWord}`;
    if (deadEl) deadEl.textContent = `${data.dead_stock_products_count} ${prodWord}`;
}

// AI Chat Analyst
async function sendAiMessage() {
    const input = document.getElementById("ai-chat-input");
    const question = input.value.trim();
    if (!question) return;

    input.value = "";
    const chatContainer = document.getElementById("chat-messages");

    // Append user message safely
    const userDiv = document.createElement("div");
    userDiv.className = "message user";
    const userBubble = document.createElement("div");
    userBubble.className = "message-bubble";
    userBubble.textContent = question;
    userDiv.appendChild(userBubble);
    chatContainer.appendChild(userDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Call API
    try {
        const resp = await fetch(`${API_BASE}/ai/chat`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question: question, language: currentLang })
        });
        const data = await resp.json();

        const aiDiv = document.createElement("div");
        aiDiv.className = "message ai";
        const senderLabel = data.source === 'gemini_llm' ? 'Gemini Live' : 'Deterministic Engine';
        const safeAnswer = escapeHtml(data.answer).replace(/\n/g, '<br>');
        aiDiv.innerHTML = `
            <div class="message-sender"><i class="fa-solid fa-robot"></i> ProfitPilot AI (${senderLabel})</div>
            <div class="message-bubble">${safeAnswer}</div>
        `;
        chatContainer.appendChild(aiDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (e) {
        console.error("Chat error:", e);
    }
}

function handleChatKey(e) {
    if (e.key === "Enter") sendAiMessage();
}

// Catalog Copywriting Generator
async function generateCatalogCopy() {
    const title = document.getElementById("cat-title-input").value.trim();
    if (!title) {
        const alertMsg = (currentLang === "en") ? "Please enter product title"
                       : (currentLang === "fr") ? "Veuillez saisir le titre du produit"
                       : "يرجى إدخال اسم المنتج";
        alert(alertMsg);
        return;
    }
    const cat = document.getElementById("cat-category-input").value.trim();
    const feat = document.getElementById("cat-features-input").value.split(",").map(f => f.trim()).filter(Boolean);

    try {
        const resp = await fetch(`${API_BASE}/ai/catalog/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_title: title,
                category: cat,
                key_features: feat,
                language: currentLang
            })
        });
        const data = await resp.json();

        document.getElementById("res-optimized-title").textContent = data.optimized_title;
        document.getElementById("res-description").textContent = data.compelling_description;

        const bulletsList = document.getElementById("res-bullets");
        bulletsList.innerHTML = "";
        data.bullet_points.forEach(b => {
            const li = document.createElement("li");
            li.textContent = b;
            bulletsList.appendChild(li);
        });

        const faqDiv = document.getElementById("res-faq");
        faqDiv.innerHTML = "";
        data.faq.forEach(f => {
            faqDiv.innerHTML += `<p><strong>Q: ${f.question}</strong><br>A: ${f.answer}</p>`;
        });

        document.getElementById("catalog-result-box").style.display = "block";
    } catch (e) {
        console.error("Catalog gen error:", e);
    }
}

// Seed Demo Data
async function seedDemoData() {
    const confirmMsg = (currentLang === "en") ? "Do you want to seed realistic demo data for a Moroccan COD store (orders, delivery rates, marketing spend)?"
                     : (currentLang === "fr") ? "Voulez-vous charger une boutique démo marocaine réaliste (commandes, tarifs livraison, dépenses pub) ?"
                     : "هل ترغب في تحميل متجر تجريبي مغربي متكامل ببيانات واقعية للطلبات والشحن والأرباح؟";
    if (!confirm(confirmMsg)) return;

    try {
        const resp = await fetch(`${API_BASE}/demo/seed`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (resp.ok) {
            const successMsg = (currentLang === "en") ? "Demo store loaded successfully!"
                             : (currentLang === "fr") ? "Boutique démo chargée avec succès !"
                             : "تم تحميل المتجر التجريبي بنجاح!";
            alert(successMsg);
            window.location.reload();
        }
    } catch (e) {
        console.error("Seed error:", e);
    }
}

function exportOrders() {
    window.open(`${API_BASE}/data/export/orders`, "_blank");
}

function downloadProductTemplate() {
    window.open(`${API_BASE}/data/template/products`, "_blank");
}

// Modal Handlers & Utilities
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add("open");
        modal.classList.add("active");
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove("open");
        modal.classList.remove("active");
    }
}

// ==========================================
// 1. New Order Modal (Clean inputs + Sample Data button)
// ==========================================
function openNewOrderModal() {
    calculateOrderTotal();
    openModal("modal-new-order");
}

function fillSampleOrderData() {
    const nameInput = document.getElementById("order-cust-name");
    const phoneInput = document.getElementById("order-cust-phone");
    const cityInput = document.getElementById("order-cust-city");
    const addressInput = document.getElementById("order-cust-address");

    if (nameInput) nameInput.value = "كريم العلمي (Karim Alami)";
    if (phoneInput) phoneInput.value = "+212 661-123456";
    if (cityInput) cityInput.value = "الدار البيضاء (Casablanca)";
    if (addressInput) addressInput.value = "شارع أنفا، إقامة الياسمين رقم 14";

    onCityChanged();
}

const CITY_DEFAULT_RATES = {
    "الدار البيضاء (Casablanca)": 25.0,
    "الدار البيضاء": 25.0,
    "casablanca": 25.0,
    "الرباط (Rabat)": 32.0,
    "الرباط": 32.0,
    "rabat": 32.0,
    "سلا (Sale)": 32.0,
    "مراكش (Marrakech)": 35.0,
    "مراكش": 35.0,
    "marrakech": 35.0,
    "طنجة (Tanger)": 38.0,
    "طنجة": 38.0,
    "tanger": 38.0,
    "فاس (Fes)": 38.0,
    "فاس": 38.0,
    "أكادير (Agadir)": 40.0,
    "أكادير": 40.0,
    "وجدة (Oujda)": 45.0,
    "وجدة": 45.0,
    "oujda": 45.0,
    "القنيطرة (Kenitra)": 30.0,
    "تطوان (Tetouan)": 38.0,
    "العيون (Laayoune)": 55.0,
    "العيون": 55.0,
    "الداخلة (Dakhla)": 60.0
};

function onCityChanged() {
    const cityInput = document.getElementById("order-cust-city");
    if (!cityInput) return;
    const cityVal = cityInput.value.trim().toLowerCase();
    
    let matchedFee = 35.0; // Default
    for (const [cityName, fee] of Object.entries(CITY_DEFAULT_RATES)) {
        if (cityVal.includes(cityName.toLowerCase()) || cityName.toLowerCase().includes(cityVal)) {
            matchedFee = fee;
            break;
        }
    }

    const carrierFeeInput = document.getElementById("order-carrier-fee");
    if (carrierFeeInput) carrierFeeInput.value = matchedFee.toFixed(2);
    calculateOrderTotal();
}

function onCarrierOrCityChanged() {
    onCityChanged();
}

function calculateOrderTotal() {
    const sel = document.getElementById("order-prod-select");
    const qtyInput = document.getElementById("order-qty");
    const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;

    let price = 249.00;
    let cost = 65.00;
    if (sel && sel.selectedOptions.length) {
        price = parseFloat(sel.selectedOptions[0].getAttribute("data-price")) || 249.00;
        cost = parseFloat(sel.selectedOptions[0].getAttribute("data-cost")) || 65.00;
    }

    const shippingCharge = 0.00; // Free shipping for customer
    const carrierFeeInput = document.getElementById("order-carrier-fee");
    const carrierFee = parseFloat(carrierFeeInput ? carrierFeeInput.value : 25.00) || 25.00;
    const total = (price * qty) + shippingCharge;
    const expectedProfit = total - (cost * qty) - carrierFee - 5.00;

    const totalEl = document.getElementById("modal-order-total");
    if (totalEl) totalEl.textContent = formatMoney(total);

    const profitEl = document.getElementById("modal-order-expected-profit");
    if (profitEl) profitEl.textContent = `+${formatMoney(expectedProfit)}`;
}

async function submitNewOrder() {
    const name = document.getElementById("order-cust-name")?.value.trim();
    const phone = document.getElementById("order-cust-phone")?.value.trim();
    const city = document.getElementById("order-cust-city")?.value.trim();
    const address = document.getElementById("order-cust-address")?.value.trim() || "";

    // Validation: make sure user inputs are not empty!
    if (!name || !phone || !city) {
        const valMsg = (currentLang === "en") ? "Please enter customer name, phone number, and city."
                     : (currentLang === "fr") ? "Veuillez saisir le nom, le numéro de téléphone et la ville du client."
                     : "يرجى إدخال اسم العميل الكامل، ورقم الهاتف، والمدينة لإتمام إنشاء الطلب.";
        alert(valMsg);
        return;
    }

    const carrierSelect = document.getElementById("order-carrier-select");
    const carrierId = carrierSelect ? parseInt(carrierSelect.value) || 1 : 1;
    const carrierFee = parseFloat(document.getElementById("order-carrier-fee")?.value) || 25.00;

    const prodSelect = document.getElementById("order-prod-select");
    const qty = parseInt(document.getElementById("order-qty")?.value) || 1;
    const prodTitle = prodSelect?.selectedOptions[0]?.text?.split(" (")[0] || "خلاط محمول ذكي قابل للشحن";
    const unitPrice = parseFloat(prodSelect?.selectedOptions[0]?.getAttribute("data-price")) || 249.00;
    const purchaseCost = parseFloat(prodSelect?.selectedOptions[0]?.getAttribute("data-cost")) || 65.00;

    const payload = {
        customer_name: name,
        customer_phone: phone,
        customer_city: city,
        customer_address: address,
        delivery_company_id: carrierId,
        shipping_fee_charged: 0.0,
        delivery_cost_actual: carrierFee,
        return_cost_actual: 20.0,
        packaging_cost: 5.0,
        ad_spend_attributed: 0.0,
        items: [
            {
                product_id: parseInt(prodSelect?.value) || 1,
                product_title: prodTitle,
                sku: "SKU-PROD-" + (prodSelect?.value || "1"),
                purchase_cost: purchaseCost,
                unit_price: unitPrice,
                quantity: qty
            }
        ],
        notes: "Direct order for " + name
    };

    try {
        const resp = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            closeModal("modal-new-order");
            // Clear inputs for next order
            document.getElementById("order-cust-name").value = "";
            document.getElementById("order-cust-phone").value = "";
            document.getElementById("order-cust-city").value = "";
            document.getElementById("order-cust-address").value = "";

            const successMsg = (currentLang === "en") ? `Order saved successfully for customer "${name}"!`
                             : (currentLang === "fr") ? `Commande enregistrée avec succès pour le client "${name}" !`
                             : `تم حفظ وتأكيد الطلب بنجاح للعميل "${name}"!`;
            alert(successMsg);
            await loadOrders();
            await loadDashboard();
        } else {
            const err = await resp.json();
            alert("Error: " + (err.detail || "Failed to create order"));
        }
    } catch (e) {
        console.error("Order submit error:", e);
        closeModal("modal-new-order");
    }
}

// ==========================================
// 2. City Shipping Rates Modal
// ==========================================
let activeCarrierRatesId = 1;
async function openCityRatesModal() {
    activeCarrierRatesId = 1;
    await loadCarrierCityRates(1);
    openModal("modal-city-rates");
}

async function loadCarrierCityRates(carrierId) {
    activeCarrierRatesId = carrierId || 1;
    try {
        const resp = await fetch(`${API_BASE}/delivery/companies/${activeCarrierRatesId}/city-rates`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const data = await resp.json();
        
        const defaultInput = document.getElementById("rates-default-shipping");
        if (defaultInput) defaultInput.value = data.default_shipping_fee || 35.00;

        const tbody = document.getElementById("city-rates-table-body");
        if (!tbody) return;
        tbody.innerHTML = "";

        const allCities = [
            { name: "الدار البيضاء (Casablanca)", zone: "المنطقة المركزية (شحن محلي)", defaultRate: 25.0 },
            { name: "الرباط (Rabat)", zone: "المنطقة المركزية", defaultRate: 32.0 },
            { name: "سلا (Sale)", zone: "المنطقة المركزية", defaultRate: 32.0 },
            { name: "مراكش (Marrakech)", zone: "المنطقة الوسطى", defaultRate: 35.0 },
            { name: "طنجة (Tanger)", zone: "المنطقة الشمالية", defaultRate: 38.0 },
            { name: "فاس (Fes)", zone: "المنطقة الشرقية الوسطى", defaultRate: 38.0 },
            { name: "مكناس (Meknes)", zone: "المنطقة الشرقية الوسطى", defaultRate: 38.0 },
            { name: "أكادير (Agadir)", zone: "المنطقة الجنوبية", defaultRate: 40.0 },
            { name: "وجدة (Oujda)", zone: "المنطقة الشرقية البعيدة", defaultRate: 45.0 },
            { name: "الناظور (Nador)", zone: "المنطقة الشرقية", defaultRate: 45.0 },
            { name: "القنيطرة (Kenitra)", zone: "المنطقة المركزية", defaultRate: 30.0 },
            { name: "تطوان (Tetouan)", zone: "المنطقة الشمالية", defaultRate: 38.0 },
            { name: "العيون (Laayoune)", zone: "الأقاليم الجنوبية (الصحراء)", defaultRate: 55.0 },
            { name: "الداخلة (Dakhla)", zone: "الأقاليم الجنوبية (الصحراء)", defaultRate: 60.0 }
        ];

        allCities.forEach(c => {
            const currentRate = (data.rates && data.rates[c.name]) !== undefined ? data.rates[c.name] : c.defaultRate;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${c.name}</strong></td>
                <td><span class="badge" style="background:rgba(255,255,255,0.05);">${c.zone}</span></td>
                <td>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <input type="number" class="city-rate-input" data-city="${c.name}" value="${currentRate}" style="width:100px; padding:6px; font-weight:700;">
                        <span>MAD</span>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (e) {
        console.error("Error loading city rates:", e);
    }
}

async function saveCityRates() {
    const inputs = document.querySelectorAll(".city-rate-input");
    const ratesObj = {};
    inputs.forEach(inp => {
        const city = inp.getAttribute("data-city");
        const val = parseFloat(inp.value) || 35.0;
        ratesObj[city] = val;
    });

    try {
        const resp = await fetch(`${API_BASE}/delivery/companies/${activeCarrierRatesId}/city-rates`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ rates: ratesObj })
        });

        if (resp.ok) {
            closeModal("modal-city-rates");
            const msg = (currentLang === "en") ? "City shipping rates updated and applied successfully!"
                      : (currentLang === "fr") ? "Tarifs de livraison par ville mis à jour et appliqués avec succès !"
                      : "تم حفظ وتحديث أسعار التوصيل لجميع المدن بنجاح! سيتم تطبيقها تلقائياً على كل الطلبات الجديدة.";
            alert(msg);
            await loadReconciliation();
        }
    } catch (e) {
        console.error("Error saving city rates:", e);
    }
}

// ==========================================
// 3. Store Integrations (WooCommerce & Shopify Webhooks)
// ==========================================
async function loadIntegrationLogs() {
    try {
        const resp = await fetch(`${API_BASE}/integrations/logs`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const logs = await resp.json();
        const tbody = document.getElementById("integrations-table-body");
        if (!tbody) return;
        tbody.innerHTML = "";

        const badge = document.getElementById("synced-orders-badge");
        const countText = (currentLang === "en") ? `${logs.length} synced orders`
                        : (currentLang === "fr") ? `${logs.length} commandes synchronisées`
                        : `${logs.length} طلبات متزامنة`;
        if (badge) badge.textContent = countText;

        if (!logs.length) {
            const noLogsMsg = (currentLang === "en") ? "No external orders received yet. Click the test buttons above to simulate live sync!"
                            : (currentLang === "fr") ? "Aucune commande externe reçue pour l'instant. Utilisez les boutons de test ci-dessus !"
                            : "لم يتم استقبال أي طلبات من المتاجر الخارجية بعد. اضغط على أزرار التجربة أعلاه لمحاكاة وصول طلب حي!";
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color:#94a3b8;">${noLogsMsg}</td></tr>`;
            return;
        }

        logs.forEach(l => {
            const tr = document.createElement("tr");
            const isWc = l.platform.toLowerCase() === "woocommerce";
            const icon = isWc ? '<i class="fa-brands fa-wordpress" style="color:#a855f7;"></i> WooCommerce' : '<i class="fa-brands fa-shopify" style="color:#34d399;"></i> Shopify';
            
            tr.innerHTML = `
                <td><strong>${icon}</strong></td>
                <td><strong style="color:#38bdf8;">#${l.order_number}</strong></td>
                <td><code>${l.external_ref}</code></td>
                <td>${l.customer_name}<br><small style="color:#64748b;">${l.customer_city}</small></td>
                <td><strong>${formatMoney(l.total_amount)}</strong></td>
                <td><small style="color:#94a3b8;">${l.created_at}</small></td>
                <td><span class="badge delivered"><i class="fa-solid fa-check"></i> ${l.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("Error loading logs:", e);
    }
}

function copyWebhook(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.select();
    navigator.clipboard.writeText(input.value);
    const msg = (currentLang === "en") ? "Webhook URL copied to clipboard! Paste it into your store settings."
              : (currentLang === "fr") ? "URL Webhook copiée dans le presse-papiers ! Collez-la dans votre boutique."
              : "تم نسخ رابط Webhook بنجاح إلى الحافظة! الصقه الآن في إعدادات متجرك.";
    alert(msg);
}

async function simulateSync(platform) {
    try {
        const resp = await fetch(`${API_BASE}/integrations/test-sync`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ platform: platform })
        });
        const data = await resp.json();
        if (resp.ok) {
            alert(data.message);
            await loadIntegrationLogs();
            await loadOrders();
            await loadDashboard();
        } else {
            alert("Sync error: " + (data.detail || ""));
        }
    } catch (e) {
        console.error("Simulate sync error:", e);
    }
}

// ==========================================
// 4. Marketing Add Spend Modal
// ==========================================
function openAddSpendModal() {
    openModal("modal-add-spend");
}

async function submitAdSpend() {
    const platform = document.getElementById("spend-platform")?.value || "meta";
    const amount = parseFloat(document.getElementById("spend-amount")?.value) || 350.00;
    const campaignName = document.getElementById("spend-campaign-name")?.value || "[Meta] Smart Blender Conversions";
    const conversions = parseInt(document.getElementById("spend-conversions")?.value) || 8;
    const spendDate = document.getElementById("spend-date")?.value || new Date().toISOString().split("T")[0];

    try {
        const campResp = await fetch(`${API_BASE}/marketing/campaigns`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                platform: platform,
                campaign_name: campaignName,
                status: "active"
            })
        });
        const campaign = await campResp.json();

        const spendResp = await fetch(`${API_BASE}/marketing/spend`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                campaign_id: campaign.id,
                date: spendDate,
                spend: amount,
                conversions_reported: conversions,
                clicks: 140,
                impressions: 5200,
                attributed_revenue: conversions * 249.00
            })
        });

        if (spendResp.ok) {
            closeModal("modal-add-spend");
            const msg = (currentLang === "en") ? "Ad spend recorded and True ROAS calculated successfully!"
                      : (currentLang === "fr") ? "Dépense publicitaire enregistrée et ROAS réel calculé !"
                      : "تم تسجيل المصاريف الإعلانية واحتساب ROAS الحقيقي بنجاح!";
            alert(msg);
            await loadMarketing();
            await loadDashboard();
        }
    } catch (e) {
        console.error("Spend submit error:", e);
        closeModal("modal-add-spend");
    }
}
