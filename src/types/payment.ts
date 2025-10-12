// Типы для платежных систем

export type PaymentMethodType =
    | 'telegram_stars'
    | 'cryptobot'
    | 'yookassa'
    | 'tribute'
    | 'balance';

export interface PaymentOption {
    id: string;
    name: string;
    icon: string;
    min_amount?: number;
    max_amount?: number;
    currency: string;
    description?: string;
    is_available: boolean;
}

export interface PaymentTransaction {
    id: number;
    method: PaymentMethodType;
    amount_kopeks: number;
    amount_rubles: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    created_at: string;
    completed_at?: string;
    description?: string;
}

export interface BalanceInfo {
    balance_kopeks: number;
    balance_rubles: number;
    currency: string;
    formatted: string;
}

