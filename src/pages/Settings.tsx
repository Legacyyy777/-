// Страница настроек подписки

import { useEffect, useState } from 'react';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';
import { useSubscription } from '@/hooks/useSubscription';
import { formatPrice } from '@/utils/format';

/**
 * Страница настроек подписки
 */
const Settings = () => {
    const { t } = useTranslation();
    const { hapticFeedback, hapticNotification, showConfirm } = useTelegram();
    const {
        subscription,
        settings,
        loading,
        loadSettings,
        updateServers,
        updateTraffic,
        updateDevices,
        deleteDevice,
        toggleAutopay,
    } = useSubscription();

    const [selectedServers, setSelectedServers] = useState<string[]>([]);
    const [autopayEnabled, setAutopayEnabled] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (settings) {
            setSelectedServers(settings.current.servers.map(s => s.uuid));
            setAutopayEnabled(subscription?.autopay_enabled || false);
        }
    }, [settings, subscription]);

    const handleServerToggle = (uuid: string) => {
        hapticFeedback('light');
        setSelectedServers(prev =>
            prev.includes(uuid)
                ? prev.filter(s => s !== uuid)
                : [...prev, uuid]
        );
    };

    const handleSaveServers = async () => {
        try {
            await updateServers(selectedServers);
            hapticNotification('success');
        } catch (err) {
            hapticNotification('error');
        }
    };

    const handleRemoveDevice = (hwid: string) => {
        showConfirm(t('settings.devices.removeConfirm'), async (confirmed) => {
            if (confirmed && hwid) {
                try {
                    await deleteDevice(hwid);
                    hapticNotification('success');
                } catch (err) {
                    hapticNotification('error');
                }
            }
        });
    };

    const handleToggleAutopay = async () => {
        const newValue = !autopayEnabled;
        try {
            await toggleAutopay(newValue);
            setAutopayEnabled(newValue);
            hapticNotification('success');
        } catch (err) {
            hapticNotification('error');
        }
    };

    if (loading && !settings) {
        return (
            <Container className="flex items-center justify-center min-h-[60vh]">
                <div className="loader"></div>
            </Container>
        );
    }

    if (!subscription?.user.has_active_subscription) {
        return (
            <>
                <Header title={t('settings.title')} showBack />
                <Container>
                    <Card className="text-center py-12">
                        <p className="text-4xl mb-4">⚠️</p>
                        <p className="text-tg-hint">Нет активной подписки</p>
                    </Card>
                </Container>
            </>
        );
    }

    return (
        <>
            <Header title={t('settings.title')} showBack />

            <Container>
                {/* Серверы */}
                <Card className="mb-4">
                    <h3 className="font-semibold mb-3">{t('settings.servers.title')}</h3>
                    <p className="text-sm text-tg-hint mb-3">{t('settings.servers.description')}</p>

                    <div className="space-y-2 mb-4">
                        {settings?.servers.available.map((server) => (
                            <label
                                key={server.uuid}
                                className="flex items-center gap-3 p-3 rounded-lg bg-tg-bg hover:bg-opacity-80 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedServers.includes(server.uuid)}
                                    onChange={() => handleServerToggle(server.uuid)}
                                    className="w-5 h-5"
                                />
                                <span className="flex-1">{server.name}</span>
                                {server.price_label && (
                                    <span className="text-sm text-tg-hint">{server.price_label}</span>
                                )}
                            </label>
                        ))}
                    </div>

                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handleSaveServers}
                        disabled={selectedServers.length < (settings?.servers.min || 1)}
                    >
                        {t('common.save')}
                    </Button>
                </Card>

                {/* Подключенные устройства */}
                <Card className="mb-4">
                    <h3 className="font-semibold mb-3">{t('settings.devices.connected')}</h3>

                    {subscription?.connected_devices && subscription.connected_devices.length > 0 ? (
                        <div className="space-y-2">
                            {subscription.connected_devices.map((device, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-tg-bg rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">{device.platform || 'Неизвестно'}</p>
                                        <p className="text-xs text-tg-hint">{device.device_model}</p>
                                        <p className="text-xs text-tg-hint">{device.last_seen}</p>
                                    </div>
                                    {device.hwid && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemoveDevice(device.hwid!)}
                                        >
                                            {t('common.delete')}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-tg-hint py-4">Нет подключенных устройств</p>
                    )}
                </Card>

                {/* Автопродление */}
                <Card>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold">{t('settings.autopay.title')}</h3>
                            <p className="text-sm text-tg-hint">{t('settings.autopay.description')}</p>
                        </div>
                        <button
                            onClick={handleToggleAutopay}
                            className={`relative w-14 h-8 rounded-full transition-colors ${autopayEnabled ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${autopayEnabled ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>
                </Card>
            </Container>
        </>
    );
};

export default Settings;

