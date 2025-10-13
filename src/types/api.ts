// Базовые типы для API ответов

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Типы пользователя
export interface User {
    telegram_id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    display_name: string;
    language?: string;
    status: string;
    subscription_status: string;
    subscription_actual_status: string;
    status_label: string;
    expires_at?: string;
    device_limit?: number;
    traffic_used_gb: number;
    traffic_used_label: string;
    traffic_limit_gb?: number;
    traffic_limit_label: string;
    lifetime_used_traffic_gb: number;
    has_active_subscription: boolean;
    promo_offer_discount_percent: number;
    promo_offer_discount_expires_at?: string;
    promo_offer_discount_source?: string;
}

// Типы сервера
export interface Server {
    uuid: string;
    name: string;
}

// Типы устройства
export interface Device {
    hwid?: string;
    platform?: string;
    device_model?: string;
    app_version?: string;
    last_seen?: string;
    last_ip?: string;
}

// Типы транзакции
export interface Transaction {
    id: number;
    type: string;
    amount_kopeks: number;
    amount_rubles: number;
    description?: string;
    payment_method?: string;
    external_id?: string;
    is_completed: boolean;
    created_at: string;
    completed_at?: string;
}

// Типы подписки
export interface Subscription {
    subscription_id?: number;
    remnawave_short_uuid?: string;
    user: User;
    subscription_url?: string;
    subscription_crypto_link?: string;
    subscription_purchase_url?: string;
    links: string[];
    ss_conf_links: Record<string, string>;
    connected_squads: string[];
    connected_servers: Server[];
    connected_devices_count: number;
    connected_devices: Device[];
    happ?: any;
    happ_link?: string;
    happ_crypto_link?: string;
    balance_kopeks: number;
    balance_rubles: number;
    balance_currency?: string;
    transactions: Transaction[];
    promo_offers: PromoOffer[];
    promo_group?: PromoGroup;
    auto_assign_promo_groups: AutoPromoGroupLevel[];
    total_spent_kopeks: number;
    total_spent_rubles: number;
    total_spent_label?: string;
    subscription_type: string;
    autopay_enabled: boolean;
    autopay_days_before?: number;
    autopay_days_options: number[];
    autopay_settings?: AutopaySettings;
    branding?: Branding;
    faq?: FAQ;
    legal_documents?: LegalDocuments;
    referral?: ReferralInfo;
    subscription_missing: boolean;
    subscription_missing_reason?: string;
    trial_available: boolean;
    trial_duration_days?: number;
    trial_status?: string;
}

// Типы промо-группы
export interface PromoGroup {
    id: number;
    name: string;
    server_discount_percent: number;
    traffic_discount_percent: number;
    device_discount_percent: number;
    period_discounts: Record<number, number>;
    apply_discounts_to_addons: boolean;
}

// Типы авто-промо группы
export interface AutoPromoGroupLevel {
    id: number;
    name: string;
    threshold_kopeks: number;
    threshold_rubles: number;
    threshold_label: string;
    is_reached: boolean;
    is_current: boolean;
    server_discount_percent: number;
    traffic_discount_percent: number;
    device_discount_percent: number;
    period_discounts: Record<number, number>;
    apply_discounts_to_addons: boolean;
}

// Типы промо-предложения
export interface PromoOffer {
    id: number;
    status: string;
    notification_type?: string;
    offer_type?: string;
    effect_type?: string;
    discount_percent: number;
    bonus_amount_kopeks: number;
    bonus_amount_label?: string;
    expires_at?: string;
    claimed_at?: string;
    is_active: boolean;
    template_id?: number;
    template_name?: string;
    button_text?: string;
    title?: string;
    message_text?: string;
    icon?: string;
    test_squads: Server[];
    active_discount_expires_at?: string;
    active_discount_started_at?: string;
    active_discount_duration_seconds?: number;
}

// Типы автопродления
export interface AutopaySettings {
    enabled: boolean;
    autopay_enabled?: boolean;
    autopay_enabled_at?: string;
    days_before?: number;
    autopay_days_before?: number;
    default_days_before?: number;
    autopay_days_options: number[];
    days_options: number[];
    options: number[];
}

// Типы брендинга
export interface Branding {
    service_name: Record<string, string>;
    service_description: Record<string, string>;
}

// Типы FAQ
export interface FAQItem {
    id: number;
    title?: string;
    content?: string;
    display_order?: number;
}

export interface FAQ {
    requested_language: string;
    language: string;
    is_enabled: boolean;
    total: number;
    items: FAQItem[];
}

// Типы юридических документов
export interface RichTextDocument {
    requested_language: string;
    language: string;
    title?: string;
    is_enabled: boolean;
    content: string;
    created_at?: string;
    updated_at?: string;
}

export interface LegalDocuments {
    public_offer?: RichTextDocument;
    service_rules?: RichTextDocument;
    privacy_policy?: RichTextDocument;
}

// Типы реферальной системы
export interface ReferralTerms {
    minimum_topup_kopeks: number;
    minimum_topup_label?: string;
    first_topup_bonus_kopeks: number;
    first_topup_bonus_label?: string;
    inviter_bonus_kopeks: number;
    inviter_bonus_label?: string;
    commission_percent: number;
    referred_user_reward_kopeks: number;
    referred_user_reward_label?: string;
}

export interface ReferralStats {
    invited_count: number;
    paid_referrals_count: number;
    active_referrals_count: number;
    total_earned_kopeks: number;
    total_earned_label?: string;
    month_earned_kopeks: number;
    month_earned_label?: string;
    conversion_rate: number;
}

export interface ReferralEarning {
    amount_kopeks: number;
    amount_label?: string;
    reason?: string;
    referral_name?: string;
    created_at?: string;
}

export interface ReferralItem {
    id: number;
    telegram_id?: number;
    full_name?: string;
    username?: string;
    created_at?: string;
    last_activity?: string;
    has_made_first_topup: boolean;
    balance_kopeks: number;
    balance_label?: string;
    total_earned_kopeks: number;
    total_earned_label?: string;
    topups_count: number;
    days_since_registration?: number;
    days_since_activity?: number;
    status?: string;
}

export interface ReferralList {
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
    current_page: number;
    total_pages: number;
    items: ReferralItem[];
}

export interface ReferralInfo {
    referral_code?: string;
    referral_link?: string;
    terms?: ReferralTerms;
    stats?: ReferralStats;
    recent_earnings: ReferralEarning[];
    referrals?: ReferralList;
}

// Типы платежей
export interface PaymentMethod {
    id: string;
    icon?: string;
    requires_amount: boolean;
    currency: string;
    min_amount_kopeks?: number;
    max_amount_kopeks?: number;
    amount_step_kopeks?: number;
}

export interface PaymentCreateRequest {
    initData: string;
    method: string;
    amountRubles?: number;
    amountKopeks?: number;
    option?: string;
}

export interface PaymentCreateResponse {
    success: boolean;
    method: string;
    payment_url?: string;
    amount_kopeks?: number;
    extra: Record<string, any>;
}

// Типы настроек подписки
export interface SubscriptionSettings {
    subscription_id: number;
    currency: string;
    current: {
        servers: Server[];
        traffic_limit_gb?: number;
        traffic_limit_label?: string;
        device_limit: number;
    };
    servers: {
        available: Array<{
            uuid: string;
            name?: string;
            price_kopeks?: number;
            price_label?: string;
            discount_percent?: number;
            is_connected: boolean;
            is_available: boolean;
            disabled_reason?: string;
        }>;
        min: number;
        max: number;
        can_update: boolean;
        hint?: string;
    };
    traffic: {
        options: Array<{
            value?: number;
            label?: string;
            price_kopeks?: number;
            price_label?: string;
            is_current: boolean;
            is_available: boolean;
            description?: string;
        }>;
        can_update: boolean;
        current_value?: number;
    };
    devices: {
        options: Array<{
            value: number;
            label?: string;
            price_kopeks?: number;
            price_label?: string;
        }>;
        can_update: boolean;
        min: number;
        max: number;
        step: number;
        current: number;
        price_kopeks?: number;
        price_label?: string;
    };
    billing?: {
        months_remaining: number;
        period_hint_days?: number;
        renews_at?: string;
    };
}

// Типы покупки подписки
export interface PurchaseOptions {
    currency: string;
    balance_kopeks?: number;
    balance_label?: string;
    subscription_id?: number;
    data: Record<string, any>;
}

export interface PurchasePeriod {
    id: string;
    days?: number;
    period_days?: number; // snake_case от API
    months?: number;
    period?: number; // от API
    priceKopeks?: number;
    price_kopeks?: number; // snake_case от API
    priceLabel?: string;
    price_label?: string; // snake_case от API
    label?: string; // от API
    originalPriceKopeks?: number;
    original_price_kopeks?: number; // snake_case от API
    originalPriceLabel?: string;
    original_price_label?: string; // snake_case от API
    discountPercent?: number;
    discount_percent?: number; // snake_case от API
    pricePerMonthKopeks?: number;
    per_month_price_kopeks?: number; // snake_case от API
    pricePerMonthLabel?: string;
    per_month_price_label?: string; // snake_case от API
    isRecommended: boolean;
    description?: string;
    badge?: string;
    title?: string;
}

// Типы промокода
export interface PromoCode {
    code: string;
    type?: string;
    balance_bonus_kopeks: number;
    subscription_days: number;
    max_uses?: number;
    current_uses?: number;
    valid_until?: string;
}

export interface PromoCodeActivationResponse {
    success: boolean;
    description?: string;
    promocode?: PromoCode;
}

