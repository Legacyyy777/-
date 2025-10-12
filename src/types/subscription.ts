// Дополнительные типы для подписок

export type SubscriptionStatus =
    | 'active'
    | 'expired'
    | 'trial'
    | 'none'
    | 'suspended';

export type PaymentStatus =
    | 'pending'
    | 'completed'
    | 'failed'
    | 'cancelled';

export interface SubscriptionPlan {
    id: string;
    name: string;
    duration_days: number;
    price_kopeks: number;
    price_rubles: number;
    discount_percent?: number;
    is_recommended?: boolean;
    features: string[];
}

export interface ServerOption {
    uuid: string;
    name: string;
    country: string;
    flag?: string;
    is_online: boolean;
    load?: number;
    ping?: number;
}

export interface TrafficOption {
    value: number; // в GB
    label: string;
    price_kopeks: number;
    is_unlimited?: boolean;
}

export interface DeviceOption {
    value: number;
    label: string;
    price_kopeks: number;
}

