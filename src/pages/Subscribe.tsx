// Страница покупки подписки

import { useEffect, useState } from 'react';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';
import { getPurchaseOptions, purchaseSubscription } from '@/api/subscriptions';
import { formatPrice } from '@/utils/format';
import type { PurchaseOptions, PurchasePeriod } from '@/types/api';

/**
 * Страница покупки подписки
 */
const Subscribe = () => {
    const { t } = useTranslation();
    const { hapticFeedback, hapticNotification, showAlert } = useTelegram();

    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [options, setOptions] = useState<PurchaseOptions | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

    // Загрузка опций при монтировании
    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        setLoading(true);
        try {
            const data = await getPurchaseOptions();
            console.log('Purchase options loaded:', data);
            setOptions(data);

            // Автоматически выбираем рекомендованный тариф
            const periods = data.data?.periods as PurchasePeriod[] | undefined;
            console.log('Periods:', periods);
            if (periods && periods.length > 0) {
                const recommended = periods.find(p => p.isRecommended);
                setSelectedPeriod(recommended?.id || periods[0].id);
            }
        } catch (err) {
            console.error('Error loading options:', err);
            hapticNotification('error');
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodSelect = (periodId: string) => {
        hapticFeedback('light');
        setSelectedPeriod(periodId);
    };

    const handlePurchase = async () => {
        if (!selectedPeriod) return;

        setPurchasing(true);
        hapticFeedback('medium');

        try {
            await purchaseSubscription({ periodId: selectedPeriod });
            hapticNotification('success');
            showAlert('Подписка успешно оформлена!', () => {
                window.location.href = '/';
            });
        } catch (err: any) {
            hapticNotification('error');
            showAlert(err.message || 'Ошибка при покупке подписки');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <Container className="flex items-center justify-center min-h-[60vh]">
                <div className="loader"></div>
            </Container>
        );
    }

    // Периоды могут быть в разных местах в зависимости от структуры ответа
    // Пробуем разные варианты структуры API
    let periods: PurchasePeriod[] | undefined;

    if (options?.data?.periods) {
        periods = options.data.periods as PurchasePeriod[];
    } else if (options?.data?.renewal_periods) {
        periods = options.data.renewal_periods as PurchasePeriod[];
    } else if (Array.isArray(options?.data)) {
        periods = options.data as PurchasePeriod[];
    } else if (options?.data) {
        // Возможно периоды находятся в другом месте
        const dataKeys = Object.keys(options.data);
        console.log('🔍 Available keys in data:', dataKeys);

        // Ищем массив периодов
        for (const key of dataKeys) {
            if (Array.isArray(options.data[key])) {
                console.log(`✅ Found array in data.${key}:`, options.data[key]);
                periods = options.data[key] as PurchasePeriod[];
                break;
            }
        }
    }

    const balance = options?.balance_kopeks || 0;

    console.log('📦 Full options object:', options);
    console.log('📋 Extracted periods:', periods);
    console.log('📋 Periods length:', periods?.length);
    console.log('💰 Balance:', balance);

    return (
        <>
            <Header title={t('subscribe.title')} showBack />

            <Container>
                {/* Баланс */}
                <Card className="mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-tg-hint">{t('balance.current')}</span>
                        <span className="text-xl font-bold text-tg-link">
                            {formatPrice(balance)}
                        </span>
                    </div>
                </Card>

                {/* Выбор тарифа */}
                <h2 className="text-lg font-semibold mb-3">{t('subscribe.selectPlan')}</h2>

                {/* Если нет тарифов - показываем сообщение */}
                {(!periods || periods.length === 0) && (
                    <Card className="text-center mb-4">
                        <div className="text-4xl mb-3">📦</div>
                        <p className="text-tg-hint mb-2">Тарифы не найдены</p>
                        <p className="text-xs text-tg-hint">Проверьте консоль для отладки</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={loadOptions}
                            className="mt-3"
                        >
                            {t('common.retry')}
                        </Button>
                    </Card>
                )}

                <div className="space-y-3 mb-6">
                    {periods?.map((period) => (
                        <Card
                            key={period.id}
                            hover
                            onClick={() => handlePeriodSelect(period.id)}
                            className={`cursor-pointer transition-all ${selectedPeriod === period.id
                                ? 'ring-2 ring-tg-link'
                                : ''
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-tg-text">
                                            {period.title || `${period.days} дней`}
                                        </h3>
                                        {period.isRecommended && (
                                            <span className="px-2 py-0.5 bg-tg-link text-white text-xs rounded-full">
                                                {t('subscribe.recommended')}
                                            </span>
                                        )}
                                        {period.badge && (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full">
                                                {period.badge}
                                            </span>
                                        )}
                                    </div>

                                    {period.description && (
                                        <p className="text-sm text-tg-hint mt-1">{period.description}</p>
                                    )}

                                    {period.pricePerMonthLabel && (
                                        <p className="text-xs text-tg-hint mt-1">
                                            {period.pricePerMonthLabel} {t('subscribe.perMonth')}
                                        </p>
                                    )}
                                </div>

                                <div className="text-right">
                                    {period.discountPercent > 0 && period.originalPriceLabel && (
                                        <p className="text-xs text-tg-hint line-through">
                                            {period.originalPriceLabel}
                                        </p>
                                    )}
                                    <p className="text-lg font-bold text-tg-link">
                                        {period.priceLabel}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Кнопка покупки */}
                {selectedPeriod && (
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={purchasing}
                        onClick={handlePurchase}
                    >
                        {t('subscribe.buy')}
                    </Button>
                )}
            </Container>
        </>
    );
};

export default Subscribe;

