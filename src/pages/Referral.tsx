// Страница реферальной программы

import { useEffect, useState } from 'react';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';
import { getReferralInfo } from '@/api/referrals';
import { formatDateTime } from '@/utils/format';
import type { ReferralInfo } from '@/types/api';

/**
 * Страница реферальной системы
 */
const Referral = () => {
    const { t } = useTranslation();
    const { hapticNotification, showAlert } = useTelegram();

    const [loading, setLoading] = useState(true);
    const [referral, setReferral] = useState<ReferralInfo | null>(null);

    useEffect(() => {
        loadReferralData();
    }, []);

    const loadReferralData = async () => {
        setLoading(true);
        try {
            const data = await getReferralInfo();
            setReferral(data);
        } catch (err) {
            console.error('Error loading referral:', err);
            hapticNotification('error');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (referral?.referral_link) {
            navigator.clipboard.writeText(referral.referral_link);
            hapticNotification('success');
            showAlert(t('common.copied'));
        }
    };

    if (loading) {
        return (
            <Container className="flex items-center justify-center min-h-[60vh]">
                <div className="loader"></div>
            </Container>
        );
    }

    const stats = referral?.stats;
    const terms = referral?.terms;
    const earnings = referral?.recent_earnings || [];
    const referrals = referral?.referrals?.items || [];

    return (
        <>
            <Header title={t('referral.title')} showBack />

            <Container>
                {/* Реферальная ссылка */}
                <Card className="mb-4">
                    <h3 className="font-semibold mb-2">{t('referral.myLink')}</h3>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={referral?.referral_link || ''}
                            className="input flex-1 text-sm"
                        />
                        <Button variant="primary" onClick={handleCopyLink}>
                            {t('common.copy')}
                        </Button>
                    </div>
                </Card>

                {/* Статистика */}
                {stats && (
                    <Card className="mb-4">
                        <h3 className="font-semibold mb-3">{t('referral.stats.title')}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-tg-bg rounded-lg">
                                <p className="text-2xl font-bold text-tg-link">{stats.invited_count}</p>
                                <p className="text-xs text-tg-hint">{t('referral.stats.invited')}</p>
                            </div>
                            <div className="text-center p-3 bg-tg-bg rounded-lg">
                                <p className="text-2xl font-bold text-tg-link">{stats.active_referrals_count}</p>
                                <p className="text-xs text-tg-hint">{t('referral.stats.active')}</p>
                            </div>
                            <div className="text-center p-3 bg-tg-bg rounded-lg">
                                <p className="text-lg font-bold text-green-500">{stats.total_earned_label}</p>
                                <p className="text-xs text-tg-hint">{t('referral.stats.earned')}</p>
                            </div>
                            <div className="text-center p-3 bg-tg-bg rounded-lg">
                                <p className="text-lg font-bold text-green-500">{stats.conversion_rate.toFixed(1)}%</p>
                                <p className="text-xs text-tg-hint">{t('referral.stats.conversion')}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Условия */}
                {terms && (
                    <Card className="mb-4">
                        <h3 className="font-semibold mb-3">{t('referral.terms.title')}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-tg-hint">{t('referral.terms.commission')}</span>
                                <span className="font-medium">{terms.commission_percent}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-tg-hint">{t('referral.terms.yourReward')}</span>
                                <span className="font-medium">{terms.inviter_bonus_label}</span>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Последние начисления */}
                {earnings.length > 0 && (
                    <Card className="mb-4">
                        <h3 className="font-semibold mb-3">{t('referral.earnings.title')}</h3>
                        <div className="space-y-2">
                            {earnings.slice(0, 5).map((earning, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-tg-bg rounded">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{earning.referral_name}</p>
                                        <p className="text-xs text-tg-hint">{earning.reason}</p>
                                    </div>
                                    <p className="text-sm font-bold text-green-500">+{earning.amount_label}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Список рефералов */}
                {referrals.length > 0 && (
                    <>
                        <h2 className="text-lg font-semibold mb-3">{t('referral.referrals.title')}</h2>
                        <div className="space-y-2">
                            {referrals.map((ref) => (
                                <Card key={ref.id} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium">{ref.full_name || ref.username}</p>
                                        <p className="text-xs text-tg-hint">{formatDateTime(ref.created_at!)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-500">{ref.total_earned_label}</p>
                                        <p className="text-xs text-tg-hint">{ref.status}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </Container>
        </>
    );
};

export default Referral;

