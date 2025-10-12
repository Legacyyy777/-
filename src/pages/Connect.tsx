// Страница пошагового подключения к VPN

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';
import { useSubscription } from '@/hooks/useSubscription';

// Определение типа устройства
type DeviceType = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';

interface AppLink {
    name: string;
    url: string;
    icon: string;
}

/**
 * Страница подключения к VPN с пошаговой инструкцией
 */
const Connect = () => {
    const { t } = useTranslation();
    const { hapticFeedback, hapticNotification, openLink } = useTelegram();
    const { subscription, loadSubscription } = useSubscription();

    const [step, setStep] = useState(1);
    const [deviceType, setDeviceType] = useState<DeviceType>('unknown');
    const [loading, setLoading] = useState(true);

    // Определяем тип устройства
    useEffect(() => {
        const detectDevice = (): DeviceType => {
            const ua = navigator.userAgent.toLowerCase();
            const platform = navigator.platform.toLowerCase();

            if (/iphone|ipad|ipod/.test(ua) || platform.includes('iphone')) {
                return 'ios';
            }
            if (/android/.test(ua)) {
                return 'android';
            }
            if (/macintosh|mac os x/.test(ua) && !('ontouchend' in document)) {
                return 'macos';
            }
            if (/win/.test(platform)) {
                return 'windows';
            }
            if (/linux/.test(platform)) {
                return 'linux';
            }
            return 'unknown';
        };

        setDeviceType(detectDevice());
    }, []);

    // Загружаем подписку
    useEffect(() => {
        const init = async () => {
            try {
                await loadSubscription();
            } catch (err) {
                console.error('Error loading subscription:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [loadSubscription]);

    // Ссылки на приложения для каждой платформы
    const appLinks: Record<DeviceType, AppLink[]> = {
        ios: [
            { name: 'Happ', url: 'https://apps.apple.com/app/happ-vpn/id6443709445', icon: '🚀' },
            { name: 'Streisand', url: 'https://apps.apple.com/app/streisand/id6450534064', icon: '🎭' },
            { name: 'Shadowrocket', url: 'https://apps.apple.com/app/shadowrocket/id932747118', icon: '🚀' },
        ],
        android: [
            { name: 'Happ', url: 'https://play.google.com/store/apps/details?id=com.happ.android', icon: '🚀' },
            { name: 'Clash Meta', url: 'https://github.com/MetaCubeX/ClashMetaForAndroid/releases', icon: '⚡' },
        ],
        windows: [
            { name: 'Hiddify', url: 'https://github.com/hiddify/hiddify-next/releases', icon: '🔒' },
            { name: 'Clash Verge', url: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', icon: '⚡' },
        ],
        macos: [
            { name: 'Hiddify', url: 'https://github.com/hiddify/hiddify-next/releases', icon: '🔒' },
            { name: 'Clash Verge', url: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', icon: '⚡' },
        ],
        linux: [
            { name: 'Hiddify', url: 'https://github.com/hiddify/hiddify-next/releases', icon: '🔒' },
            { name: 'Clash Verge', url: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', icon: '⚡' },
        ],
        unknown: [],
    };

    const currentLinks = appLinks[deviceType] || [];
    const subscriptionUrl = subscription?.subscription_url || '';
    const hasSubscription = subscription?.user?.has_active_subscription;

    // Название устройства для отображения
    const deviceNames: Record<DeviceType, string> = {
        ios: 'iOS (iPhone/iPad)',
        android: 'Android',
        windows: 'Windows',
        macos: 'macOS',
        linux: 'Linux',
        unknown: t('connect.unknown_device'),
    };

    // Открыть приложение с подпиской
    const handleConnectToApp = () => {
        hapticFeedback('medium');

        if (!subscriptionUrl) {
            hapticNotification('error');
            return;
        }

        // Копируем ссылку в буфер обмена
        navigator.clipboard.writeText(subscriptionUrl).then(() => {
            hapticNotification('success');
        }).catch(() => {
            console.error('Failed to copy to clipboard');
        });

        // Пытаемся открыть через разные методы
        if (deviceType === 'ios' || deviceType === 'android') {
            // Вариант 1: Прямая ссылка (работает для большинства клиентов)
            // Многие VPN клиенты распознают ссылки типа sub://...
            try {
                // Пробуем разные варианты deep links
                const deepLinks = [
                    subscriptionUrl, // Прямая ссылка
                    `happ://install-config?url=${encodeURIComponent(subscriptionUrl)}`,
                    `sing-box://import-remote-profile?url=${encodeURIComponent(subscriptionUrl)}`,
                    `clash://install-config?url=${encodeURIComponent(subscriptionUrl)}`,
                ];

                // Пробуем открыть первый вариант
                const link = document.createElement('a');
                link.href = deepLinks[0];
                link.click();

                // Показываем инструкцию через 1.5 секунды
                setTimeout(() => {
                    setStep(4);
                }, 1500);
            } catch (err) {
                console.error('Failed to open deep link:', err);
                setStep(4);
            }
        } else {
            // Для десктопа показываем инструкцию
            setStep(4);
        }
    };

    // Копировать ссылку подписки
    const handleCopyLink = () => {
        hapticFeedback('light');
        if (subscriptionUrl) {
            navigator.clipboard.writeText(subscriptionUrl);
            hapticNotification('success');
        }
    };

    if (loading) {
        return (
            <Container className="flex items-center justify-center min-h-[60vh]">
                <div className="loader"></div>
            </Container>
        );
    }

    // Если нет подписки
    if (!hasSubscription) {
        return (
            <>
                <Header title={t('connect.title')} showBack />
                <Container>
                    <Card className="text-center">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-xl font-bold mb-2">{t('connect.no_subscription')}</h2>
                        <p className="text-tg-hint mb-4">{t('connect.need_subscription')}</p>
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={() => window.location.href = '/subscribe'}
                        >
                            {t('connect.buy_subscription')}
                        </Button>
                    </Card>
                </Container>
            </>
        );
    }

    return (
        <>
            <Header title={t('connect.title')} showBack />

            <Container>
                {/* Индикатор шагов */}
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                    ? 'bg-tg-link text-white'
                                    : 'bg-tg-secondaryBg text-tg-hint'
                                    }`}
                            >
                                {s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={`flex-1 h-1 mx-2 transition-all ${step > s ? 'bg-tg-link' : 'bg-tg-secondaryBg'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Шаг 1: Определение устройства */}
                {step === 1 && (
                    <>
                        <Card className="mb-4">
                            <div className="text-center">
                                <div className="text-6xl mb-4">
                                    {deviceType === 'ios' && '📱'}
                                    {deviceType === 'android' && '🤖'}
                                    {deviceType === 'windows' && '💻'}
                                    {deviceType === 'macos' && '🍎'}
                                    {deviceType === 'linux' && '🐧'}
                                    {deviceType === 'unknown' && '❓'}
                                </div>
                                <h2 className="text-xl font-bold mb-2">{t('connect.step1.title')}</h2>
                                <p className="text-tg-hint mb-4">
                                    {t('connect.step1.detected')}: <strong>{deviceNames[deviceType]}</strong>
                                </p>

                                {deviceType !== 'unknown' && (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        onClick={() => {
                                            hapticFeedback('light');
                                            setStep(2);
                                        }}
                                    >
                                        {t('connect.step1.continue')}
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* Ручной выбор устройства */}
                        <Card>
                            <h3 className="text-sm font-semibold mb-3 text-center text-tg-hint">
                                {t('connect.step1.manual_select')}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {(['ios', 'android', 'windows', 'macos', 'linux'] as DeviceType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            hapticFeedback('light');
                                            setDeviceType(type);
                                            setTimeout(() => setStep(2), 300);
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 ${deviceType === type
                                                ? 'border-tg-link bg-tg-link/10 shadow-lg'
                                                : 'border-transparent bg-tg-secondaryBg hover:border-tg-link/30 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="text-4xl mb-2">
                                            {type === 'ios' && '📱'}
                                            {type === 'android' && '🤖'}
                                            {type === 'windows' && '💻'}
                                            {type === 'macos' && '🍎'}
                                            {type === 'linux' && '🐧'}
                                        </div>
                                        <div className="text-sm font-medium text-tg-text">
                                            {deviceNames[type].replace(/\s*\(.*?\)\s*/g, '')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </>
                )}

                {/* Шаг 2: Выбор и скачивание приложения */}
                {step === 2 && (
                    <>
                        <Card className="mb-4">
                            <h2 className="text-lg font-bold mb-2">{t('connect.step2.title')}</h2>
                            <p className="text-sm text-tg-hint mb-4">{t('connect.step2.description')}</p>
                        </Card>

                        <div className="space-y-3 mb-4">
                            {currentLinks.map((app, index) => (
                                <Card
                                    key={app.name}
                                    hover
                                    className={`cursor-pointer ${index === 0 ? 'ring-2 ring-tg-link' : ''}`}
                                    onClick={() => {
                                        hapticFeedback('light');
                                        openLink(app.url);
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{app.icon}</span>
                                            <div>
                                                <h3 className="font-semibold">{app.name}</h3>
                                                {index === 0 && (
                                                    <span className="text-xs text-tg-link">
                                                        {t('connect.step2.recommended')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-2xl">📥</span>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => {
                                    hapticFeedback('light');
                                    setStep(1);
                                }}
                            >
                                {t('common.back')}
                            </Button>
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => {
                                    hapticFeedback('light');
                                    setStep(3);
                                }}
                            >
                                {t('connect.step2.installed')}
                            </Button>
                        </div>
                    </>
                )}

                {/* Шаг 3: Подключение */}
                {step === 3 && (
                    <>
                        <Card className="mb-4">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🔗</div>
                                <h2 className="text-xl font-bold mb-2">{t('connect.step3.title')}</h2>
                                <p className="text-sm text-tg-hint mb-4">{t('connect.step3.description')}</p>
                            </div>
                        </Card>

                        {/* Ссылка подписки */}
                        <Card className="mb-4">
                            <p className="text-xs text-tg-hint mb-2">{t('connect.step3.your_link')}</p>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={subscriptionUrl}
                                    className="input flex-1 text-xs"
                                />
                                <Button onClick={handleCopyLink}>
                                    {t('common.copy')}
                                </Button>
                            </div>
                        </Card>

                        {/* Большая кнопка подключения */}
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleConnectToApp}
                            className="mb-3 py-6 text-xl"
                        >
                            <span className="mr-2">🚀</span>
                            {t('connect.step3.connect_button')}
                        </Button>

                        {/* Альтернатива - открыть ссылку напрямую */}
                        {(deviceType === 'ios' || deviceType === 'android') && (
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => {
                                    hapticFeedback('light');
                                    // Открываем ссылку в новой вкладке/приложении
                                    window.open(subscriptionUrl, '_blank');
                                }}
                                className="mb-4"
                            >
                                <span className="mr-2">🔗</span>
                                {t('connect.step3.open_link')}
                            </Button>
                        )}

                        <Card>
                            <p className="text-xs text-tg-hint text-center">
                                {t('connect.step3.manual_hint')}
                            </p>
                        </Card>

                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => {
                                hapticFeedback('light');
                                setStep(2);
                            }}
                            className="mt-4"
                        >
                            {t('common.back')}
                        </Button>
                    </>
                )}

                {/* Шаг 4: Ручная инструкция (если deep link не сработал) */}
                {step === 4 && (
                    <>
                        <Card className="mb-4">
                            <h2 className="text-lg font-bold mb-4">{t('connect.step4.title')}</h2>
                            <ol className="space-y-3 text-sm">
                                <li className="flex gap-3">
                                    <span className="font-bold text-tg-link">1.</span>
                                    <span>{t('connect.step4.instruction1')}</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-tg-link">2.</span>
                                    <span>{t('connect.step4.instruction2')}</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-tg-link">3.</span>
                                    <span>{t('connect.step4.instruction3')}</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-tg-link">4.</span>
                                    <span>{t('connect.step4.instruction4')}</span>
                                </li>
                            </ol>
                        </Card>

                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleCopyLink}
                            className="mb-4"
                        >
                            {t('connect.step4.copy_link_again')}
                        </Button>

                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => {
                                hapticFeedback('light');
                                setStep(3);
                            }}
                        >
                            {t('common.back')}
                        </Button>
                    </>
                )}
            </Container>
        </>
    );
};

export default Connect;

