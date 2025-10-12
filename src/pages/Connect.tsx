// Улучшенная страница подключения к VPN (быстрее и компактнее)

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';
import { useSubscription } from '@/hooks/useSubscription';

type DeviceType = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';

interface AppConfig {
    id: string;
    name: string;
    icon: string;
    downloadUrl: string;
    urlScheme: string;
}

const Connect = () => {
    const { t } = useTranslation();
    const { hapticFeedback, hapticNotification, openLink } = useTelegram();
    const { subscription, loadSubscription } = useSubscription();

    const [deviceType, setDeviceType] = useState<DeviceType>('unknown');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeviceSelect, setShowDeviceSelect] = useState(false);
    const [showManualInstructions, setShowManualInstructions] = useState(false);

    // Конфигурация приложений
    const apps: Record<DeviceType, AppConfig[]> = {
        ios: [
            { id: 'happ-eu', name: 'Happ [EU]', icon: '🚀', downloadUrl: 'https://apps.apple.com/us/app/happ-proxy-utility/id6504287215', urlScheme: 'happ://add/' },
            { id: 'happ-ru', name: 'Happ [RU]', icon: '🚀', downloadUrl: 'https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973', urlScheme: 'happ://add/' },
            { id: 'streisand', name: 'Streisand', icon: '🎭', downloadUrl: 'https://apps.apple.com/app/streisand/id6450534064', urlScheme: 'streisand://import/' },
            { id: 'shadowrocket', name: 'Shadowrocket', icon: '⚡', downloadUrl: 'https://apps.apple.com/app/shadowrocket/id932747118', urlScheme: 'sub://' },
        ],
        android: [
            { id: 'happ', name: 'Happ', icon: '🚀', downloadUrl: 'https://play.google.com/store/apps/details?id=com.happproxy', urlScheme: 'happ://add/' },
            { id: 'happ-apk', name: 'Happ APK', icon: '📦', downloadUrl: 'https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk', urlScheme: 'happ://add/' },
            { id: 'clash-meta', name: 'Clash Meta', icon: '⚡', downloadUrl: 'https://github.com/MetaCubeX/ClashMetaForAndroid/releases', urlScheme: 'clash://install-config?url=' },
        ],
        windows: [
            { id: 'hiddify', name: 'Hiddify', icon: '🔒', downloadUrl: 'https://github.com/hiddify/hiddify-next/releases', urlScheme: 'hiddify://import/' },
            { id: 'clash-verge', name: 'Clash Verge', icon: '⚡', downloadUrl: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', urlScheme: 'clash://install-config?url=' },
        ],
        macos: [
            { id: 'hiddify', name: 'Hiddify', icon: '🔒', downloadUrl: 'https://github.com/hiddify/hiddify-next/releases', urlScheme: 'hiddify://import/' },
            { id: 'clash-verge', name: 'Clash Verge', icon: '⚡', downloadUrl: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', urlScheme: 'clash://install-config?url=' },
        ],
        linux: [
            { id: 'hiddify', name: 'Hiddify', icon: '🔒', downloadUrl: 'https://github.com/hiddify/hiddify-next/releases', urlScheme: 'hiddify://import/' },
            { id: 'clash-verge', name: 'Clash Verge', icon: '⚡', downloadUrl: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', urlScheme: 'clash://install-config?url=' },
        ],
        unknown: [],
    };

    const deviceIcons: Record<DeviceType, string> = {
        ios: '📱', android: '🤖', windows: '💻', macos: '🍎', linux: '🐧', unknown: '❓'
    };

    const currentApps = apps[deviceType] || [];
    const subscriptionUrl = subscription?.subscription_url || '';
    const hasSubscription = subscription?.user?.has_active_subscription;

    // Определяем устройство
    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();

        let detected: DeviceType = 'unknown';
        if (/iphone|ipad|ipod/.test(ua)) detected = 'ios';
        else if (/android/.test(ua)) detected = 'android';
        else if (/macintosh|mac os x/.test(ua)) detected = 'macos';
        else if (/win/.test(platform)) detected = 'windows';
        else if (/linux/.test(platform)) detected = 'linux';

        setDeviceType(detected);
    }, []);

    // Загружаем подписку
    useEffect(() => {
        loadSubscription().finally(() => setLoading(false));
    }, [loadSubscription]);

    // Автовыбор первого приложения
    useEffect(() => {
        if (currentApps.length > 0 && !selectedApp) {
            setSelectedApp(currentApps[0].id);
        }
    }, [deviceType, currentApps, selectedApp]);

    // Подключение
    const handleConnect = () => {
        hapticFeedback('medium');
        if (!subscriptionUrl || !selectedApp) return;

        // Копируем ссылку
        navigator.clipboard.writeText(subscriptionUrl).then(() => {
            hapticNotification('success');
        });

        const app = currentApps.find(a => a.id === selectedApp);
        if (!app) return;

        // Формируем deep link
        let deepLink: string;
        if (app.urlScheme === 'sub://') {
            deepLink = `sub://${btoa(subscriptionUrl)}`;
        } else if (app.urlScheme.includes('?url=')) {
            deepLink = `${app.urlScheme}${encodeURIComponent(subscriptionUrl)}`;
        } else {
            deepLink = `${app.urlScheme}${encodeURIComponent(subscriptionUrl)}`;
        }

        console.log('🚀 App:', app.name);
        console.log('🔗 Deep link:', deepLink);
        console.log('📋 Original URL:', subscriptionUrl);

        // МЕТОД 1: Создаем невидимую ссылку и кликаем (работает в некоторых WebView)
        const link = document.createElement('a');
        link.href = deepLink;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);

        try {
            link.click();
            console.log('✅ Method 1: link.click() executed');
        } catch (err) {
            console.error('❌ Method 1 failed:', err);
        }

        // МЕТОД 2: Пробуем через Telegram API (может не работать для custom schemes)
        setTimeout(() => {
            try {
                openLink(deepLink);
                console.log('✅ Method 2: openLink() executed');
            } catch (err) {
                console.error('❌ Method 2 failed:', err);
            }
        }, 100);

        // МЕТОД 3: Пробуем прямую ссылку через Telegram API
        setTimeout(() => {
            try {
                openLink(subscriptionUrl);
                console.log('✅ Method 3: openLink(direct) executed');
            } catch (err) {
                console.error('❌ Method 3 failed:', err);
            }
        }, 200);

        // Очищаем временный элемент
        setTimeout(() => {
            document.body.removeChild(link);
        }, 1000);
    };

    if (loading) {
        return (
            <Container className="flex items-center justify-center min-h-[60vh]">
                <div className="loader"></div>
            </Container>
        );
    }

    if (!hasSubscription) {
        return (
            <>
                <Header title={t('connect.title')} showBack />
                <Container>
                    <Card className="text-center">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-xl font-bold mb-2">{t('connect.no_subscription')}</h2>
                        <p className="text-tg-hint mb-4">{t('connect.need_subscription')}</p>
                        <Button variant="primary" size="lg" fullWidth onClick={() => window.location.href = '/subscribe'}>
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
                {/* Быстрый выбор устройства */}
                <Card className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">{deviceIcons[deviceType]}</span>
                            <div>
                                <p className="text-xs text-tg-hint">{t('connect.your_device')}</p>
                                <p className="font-semibold">{deviceType.toUpperCase()}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                hapticFeedback('light');
                                setShowDeviceSelect(!showDeviceSelect);
                            }}
                            className="text-sm text-tg-link font-medium"
                        >
                            {t('connect.change')} {showDeviceSelect ? '▲' : '▼'}
                        </button>
                    </div>

                    {/* Выбор устройства (спойлер) */}
                    {showDeviceSelect && (
                        <div className="grid grid-cols-5 gap-2 pt-3 border-t border-tg-hint/20 animate-fade-in">
                            {(['ios', 'android', 'windows', 'macos', 'linux'] as DeviceType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        hapticFeedback('light');
                                        setDeviceType(type);
                                        setSelectedApp(null);
                                        setShowDeviceSelect(false);
                                    }}
                                    className={`p-2 rounded-lg transition-all active:scale-95 ${deviceType === type
                                        ? 'bg-tg-link/10 border-2 border-tg-link'
                                        : 'bg-tg-secondaryBg border-2 border-transparent'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{deviceIcons[type]}</div>
                                    <div className="text-[10px] font-medium">{type.toUpperCase()}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Компактный выбор приложения */}
                <Card className="mb-4">
                    <h3 className="text-sm font-semibold mb-3">{t('connect.select_app')}</h3>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {currentApps.map((app, index) => (
                            <button
                                key={app.id}
                                onClick={() => {
                                    hapticFeedback('light');
                                    setSelectedApp(app.id);
                                }}
                                className={`p-3 rounded-lg border-2 transition-all active:scale-95 ${selectedApp === app.id
                                    ? 'border-tg-link bg-tg-link/10 shadow-md'
                                    : 'border-transparent bg-tg-secondaryBg hover:border-tg-link/30'
                                    }`}
                            >
                                <div className="text-3xl mb-1">{app.icon}</div>
                                <div className="text-sm font-medium mb-1">{app.name}</div>
                                {index === 0 && (
                                    <div className="text-[10px] text-tg-link">⭐ {t('connect.step2.recommended')}</div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Кнопка скачать для выбранного приложения */}
                    {selectedApp && (
                        <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            onClick={() => {
                                hapticFeedback('light');
                                const app = currentApps.find(a => a.id === selectedApp);
                                if (app) openLink(app.downloadUrl);
                            }}
                        >
                            <span className="mr-1">📥</span>
                            {t('connect.download_app')}
                        </Button>
                    )}
                </Card>

                {/* Большая кнопка подключения */}
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => {
                        if (!selectedApp) return;

                        const app = currentApps.find(a => a.id === selectedApp);
                        if (!app) return;

                        // Формируем deep link как в оригинале
                        const deepLink = `${app.urlScheme}${subscriptionUrl}`;

                        // Сразу открываем deep link через window.open как в оригинале
                        window.open(deepLink, '_blank');
                    }}
                    className="mb-3 py-6 text-xl"
                    disabled={!selectedApp}
                >
                    <span className="mr-2">⚡</span>
                    {t('connect.connect_now')}
                </Button>

                {/* Альтернатива - просто скопировать */}
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                        hapticFeedback('light');
                        navigator.clipboard.writeText(subscriptionUrl).then(() => {
                            hapticNotification('success');
                        });
                    }}
                    className="mb-4"
                >
                    <span className="mr-1">📋</span>
                    {t('connect.copy_link')}
                </Button>

                {/* Ручная инструкция (спойлер) */}
                <Card>
                    <button
                        onClick={() => {
                            hapticFeedback('light');
                            setShowManualInstructions(!showManualInstructions);
                        }}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h3 className="text-sm font-semibold text-tg-hint">
                            {t('connect.manual_instructions')}
                        </h3>
                        <span className={`text-xl transition-transform duration-200 ${showManualInstructions ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {showManualInstructions && (
                        <ol className="mt-4 space-y-2 text-sm animate-fade-in">
                            <li className="flex gap-2">
                                <span className="font-bold text-tg-link">1.</span>
                                <span>{t('connect.step4.instruction1')}</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-tg-link">2.</span>
                                <span>{t('connect.step4.instruction2')}</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-tg-link">3.</span>
                                <span>{t('connect.step4.instruction3')}</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-tg-link">4.</span>
                                <span>{t('connect.step4.instruction4')}</span>
                            </li>
                        </ol>
                    )}
                </Card>
            </Container>
        </>
    );
};

export default Connect;

