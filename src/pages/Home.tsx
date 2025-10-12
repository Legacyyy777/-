// Главная страница - Dashboard с информацией о подписке

import { useEffect, useState } from 'react';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import { useTranslation } from '@/i18n';
import { useSubscription } from '@/hooks/useSubscription';
import { useTelegram } from '@/hooks/useTelegram';
import { formatPrice, formatTraffic, formatTimeUntil } from '@/utils/format';

/**
 * Главная страница приложения
 * Отображает статус подписки, трафик, устройства
 */
const Home = () => {
    const { t } = useTranslation();
    const { subscription, loading, loadSubscription } = useSubscription();
    const { hapticNotification } = useTelegram();
    const [refreshing, setRefreshing] = useState(false);

    // Загрузка данных при монтировании
    useEffect(() => {
        loadSubscription().catch((err) => {
            console.error('Error loading subscription:', err);
            hapticNotification('error');
        });
    }, [loadSubscription, hapticNotification]);

    // Обработка обновления данных
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await loadSubscription();
            hapticNotification('success');
        } catch (err) {
            hapticNotification('error');
        } finally {
            setRefreshing(false);
        }
    };

    // Loader при первой загрузке
    if (loading && !subscription) {
        return (
            <Container className="flex items-center justify-center min-h-[60vh]">
                <div className="loader"></div>
            </Container>
        );
    }

    const user = subscription?.user;
    const hasSubscription = user?.has_active_subscription;
    const trafficUsedPercent = user ?
        (user.traffic_limit_gb ? (user.traffic_used_gb / user.traffic_limit_gb) * 100 : 0) : 0;

    return (
        <>
            <Header
                title={t('home.title')}
                rightAction={
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-tg-secondaryBg hover:opacity-80 transition-opacity active:scale-95 disabled:opacity-50"
                        aria-label={t('common.refresh')}
                    >
                        <span className={`text-lg ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
                    </button>
                }
            />

            <Container>
                {/* Статус подписки */}
                <div className="card mb-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-tg-text">
                            Статус подписки
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${hasSubscription
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                            {hasSubscription ? t('home.status.active') : t('home.status.none')}
                        </span>
                    </div>

                    {hasSubscription && user?.expires_at && (
                        <div className="mt-3 text-sm text-tg-hint">
                            {t('home.expiresIn')}: <span className="font-medium text-tg-text">
                                {formatTimeUntil(user.expires_at)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Трафик */}
                {hasSubscription && (
                    <div className="card mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-lg font-semibold text-tg-text mb-3">
                            {t('home.traffic.title')}
                        </h2>

                        {/* Progress bar с градиентом */}
                        <div className="mb-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-tg-link rounded-full transition-all duration-700 relative overflow-hidden"
                                    style={{ width: `${Math.min(trafficUsedPercent, 100)}%` }}
                                >
                                    {/* Shimmer эффект */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-tg-hint">
                                {t('home.traffic.used')}: <span className="font-medium text-tg-text">
                                    {formatTraffic(user?.traffic_used_gb || 0)}
                                </span>
                            </span>
                            <span className="text-tg-hint">
                                {t('home.traffic.remaining')}: <span className="font-medium text-tg-text">
                                    {user?.traffic_limit_gb
                                        ? formatTraffic(user.traffic_limit_gb - (user.traffic_used_gb || 0))
                                        : t('home.traffic.unlimited')}
                                </span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Устройства */}
                {hasSubscription && (
                    <div className="card mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-lg font-semibold text-tg-text mb-3">
                            {t('home.devices.title')}
                        </h2>
                        <div className="flex items-center justify-between">
                            <span className="text-tg-hint">{t('home.devices.connected')}</span>
                            <span className="text-2xl font-bold text-tg-link">
                                {subscription?.connected_devices_count || 0} / {user?.device_limit || 0}
                            </span>
                        </div>
                    </div>
                )}

                {/* Баланс */}
                <div className="card mb-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-tg-text">
                                {t('balance.current')}
                            </h2>
                            <p className="text-2xl font-bold text-tg-link mt-1">
                                {formatPrice(subscription?.balance_kopeks || 0)}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/balance'}
                            className="btn-primary"
                        >
                            {t('balance.topup')}
                        </button>
                    </div>
                </div>

                {/* Быстрые действия */}
                {!hasSubscription && subscription?.trial_available && (
                    <button
                        onClick={() => window.location.href = '/subscribe'}
                        className="w-full btn-primary py-4 text-lg animate-fade-in"
                        style={{ animationDelay: '0.4s' }}
                    >
                        {t('home.actions.getTrial')}
                    </button>
                )}
            </Container>
        </>
    );
};

export default Home;

