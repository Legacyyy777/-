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
    id: string;
    name: string;
    url: string;
    icon: string;
    urlScheme: string; // Схема для deep link
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
    const [showManualSelect, setShowManualSelect] = useState(false);
    const [selectedApp, setSelectedApp] = useState<string | null>(null);

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

    // Ссылки на приложения для каждой платформы с URL схемами
    const appLinks: Record<DeviceType, AppLink[]> = {
        ios: [
            { 
                id: 'happ-eu',
                name: 'Happ [EU]', 
                url: 'https://apps.apple.com/us/app/happ-proxy-utility/id6504287215', 
                icon: '🚀',
                urlScheme: 'happ://add/'
            },
            { 
                id: 'happ-ru',
                name: 'Happ [RU]', 
                url: 'https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973', 
                icon: '🚀',
                urlScheme: 'happ://add/'
            },
            { 
                id: 'streisand',
                name: 'Streisand', 
                url: 'https://apps.apple.com/app/streisand/id6450534064', 
                icon: '🎭',
                urlScheme: 'streisand://import/'
            },
            { 
                id: 'shadowrocket',
                name: 'Shadowrocket', 
                url: 'https://apps.apple.com/app/shadowrocket/id932747118', 
                icon: '⚡',
                urlScheme: 'sub://'
            },
        ],
        android: [
            { 
                id: 'happ-play',
                name: 'Happ', 
                url: 'https://play.google.com/store/apps/details?id=com.happproxy', 
                icon: '🚀',
                urlScheme: 'happ://add/'
            },
            { 
                id: 'happ-apk',
                name: 'Happ [APK]', 
                url: 'https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk', 
                icon: '📦',
                urlScheme: 'happ://add/'
            },
            { 
                id: 'clash-meta',
                name: 'Clash Meta', 
                url: 'https://github.com/MetaCubeX/ClashMetaForAndroid/releases', 
                icon: '⚡',
                urlScheme: 'clash://install-config?url='
            },
        ],
        windows: [
            { 
                id: 'hiddify-win',
                name: 'Hiddify', 
                url: 'https://github.com/hiddify/hiddify-next/releases', 
                icon: '🔒',
                urlScheme: 'hiddify://import/'
            },
            { 
                id: 'clash-verge-win',
                name: 'Clash Verge', 
                url: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', 
                icon: '⚡',
                urlScheme: 'clash://install-config?url='
            },
        ],
        macos: [
            { 
                id: 'hiddify-mac',
                name: 'Hiddify', 
                url: 'https://github.com/hiddify/hiddify-next/releases', 
                icon: '🔒',
                urlScheme: 'hiddify://import/'
            },
            { 
                id: 'clash-verge-mac',
                name: 'Clash Verge', 
                url: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', 
                icon: '⚡',
                urlScheme: 'clash://install-config?url='
            },
        ],
        linux: [
            { 
                id: 'hiddify-linux',
                name: 'Hiddify', 
                url: 'https://github.com/hiddify/hiddify-next/releases', 
                icon: '🔒',
                urlScheme: 'hiddify://import/'
            },
            { 
                id: 'clash-verge-linux',
                name: 'Clash Verge', 
                url: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', 
                icon: '⚡',
                urlScheme: 'clash://install-config?url='
            },
        ],
        unknown: [],
    };

    const currentLinks = appLinks[deviceType] || [];
    const subscriptionUrl = subscription?.subscription_url || '';
    const hasSubscription = subscription?.user?.has_active_subscription;

    // Автоматически выбираем первое приложение при смене платформы
    useEffect(() => {
        if (currentLinks.length > 0 && !selectedApp) {
            setSelectedApp(currentLinks[0].id);
        }
    }, [deviceType, currentLinks]);

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
            console.log('✅ Link copied to clipboard');
        }).catch((err) => {
            console.error('Failed to copy to clipboard:', err);
        });

        // Находим выбранное приложение
        const selectedAppData = currentLinks.find(app => app.id === selectedApp);
        const urlScheme = selectedAppData?.urlScheme || 'happ://add/';

        // Формируем deep link в зависимости от выбранного приложения
        let deepLinkUrl: string;
        
        if (urlScheme === 'sub://') {
            // Shadowrocket требует base64 кодирование
            const base64Url = btoa(subscriptionUrl);
            deepLinkUrl = `${urlScheme}${base64Url}`;
        } else if (urlScheme.includes('?url=')) {
            // Clash и другие используют параметр url
            deepLinkUrl = `${urlScheme}${encodeURIComponent(subscriptionUrl)}`;
        } else {
            // Happ, Streisand, Hiddify используют прямое добавление
            deepLinkUrl = `${urlScheme}${encodeURIComponent(subscriptionUrl)}`;
        }

        console.log('📱 Device type:', deviceType);
        console.log('📲 Selected app:', selectedApp);
        console.log('🔗 URL Scheme:', urlScheme);
        console.log('🔗 Deep link:', deepLinkUrl);
        console.log('📋 Original URL:', subscriptionUrl);

        // Используем Telegram API для открытия ссылок
        try {
            // Открываем через Telegram API
            console.log('🚀 Calling openLink...');
            openLink(deepLinkUrl);
            console.log('✅ openLink called successfully');

            // НЕ переходим автоматически! Пусть пользователь сам нажмет кнопку если нужно
        } catch (err) {
            console.error('❌ Failed to open link:', err);
            // Только если ошибка - переходим к инструкции
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

                        {/* Ручной выбор устройства (спойлер) */}
                        <Card>
                            <button
                                onClick={() => {
                                    hapticFeedback('light');
                                    setShowManualSelect(!showManualSelect);
                                }}
                                className="w-full flex items-center justify-between text-left transition-colors"
                            >
                                <h3 className="text-sm font-semibold text-tg-hint">
                                    {t('connect.step1.manual_select')}
                                </h3>
                                <span className={`text-xl transition-transform duration-200 ${showManualSelect ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {showManualSelect && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
                                    {(['ios', 'android', 'windows', 'macos', 'linux'] as DeviceType[]).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                hapticFeedback('light');
                                                setDeviceType(type);
                                                setShowManualSelect(false);
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
                            )}
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
                            {currentLinks.map((app, index) => {
                                const isSelected = selectedApp === app.id;
                                const isFirst = index === 0;
                                
                                return (
                                    <Card
                                        key={app.id}
                                        hover
                                        className={`cursor-pointer transition-all ${
                                            isSelected 
                                                ? 'ring-2 ring-tg-link bg-tg-link/5' 
                                                : isFirst && !selectedApp 
                                                    ? 'ring-2 ring-tg-link/50' 
                                                    : ''
                                        }`}
                                    >
                                        {/* Выбор приложения (радио кнопка) */}
                                        <div 
                                            className="flex items-center justify-between mb-3"
                                            onClick={() => {
                                                hapticFeedback('light');
                                                setSelectedApp(app.id);
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{app.icon}</span>
                                                <div>
                                                    <h3 className="font-semibold">{app.name}</h3>
                                                    {isFirst && (
                                                        <span className="text-xs text-tg-link">
                                                            {t('connect.step2.recommended')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Радио индикатор */}
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                isSelected 
                                                    ? 'border-tg-link bg-tg-link' 
                                                    : 'border-tg-hint'
                                            }`}>
                                                {isSelected && (
                                                    <div className="w-3 h-3 bg-white rounded-full" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Кнопка скачивания */}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            fullWidth
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hapticFeedback('light');
                                                openLink(app.url);
                                            }}
                                        >
                                            <span className="mr-1">📥</span>
                                            {t('connect.step2.download')}
                                        </Button>
                                    </Card>
                                );
                            })}
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
                                    // Используем Telegram API для надежного открытия
                                    openLink(subscriptionUrl, { try_instant_view: false });
                                }}
                                className="mb-4"
                            >
                                <span className="mr-2">🔗</span>
                                {t('connect.step3.open_link')}
                            </Button>
                        )}

                        <Card className="mb-4">
                            <p className="text-xs text-tg-hint text-center">
                                {t('connect.step3.manual_hint')}
                            </p>
                        </Card>

                        {/* Кнопка для перехода к ручной инструкции */}
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => {
                                hapticFeedback('light');
                                setStep(4);
                            }}
                            className="mb-2"
                        >
                            {t('connect.step3.manual_instruction')}
                        </Button>

                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => {
                                hapticFeedback('light');
                                setStep(2);
                            }}
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

