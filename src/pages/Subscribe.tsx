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

    const periods = options?.data?.periods as PurchasePeriod[] | undefined;
    const balance = options?.balance_kopeks || 0;

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

