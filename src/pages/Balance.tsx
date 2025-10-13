// Страница баланса и пополнения

import { useEffect, useState } from 'react';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';
import { useSubscription } from '@/hooks/useSubscription';
import { usePayments } from '@/hooks/usePayments';
import { activatePromoCode } from '@/api/promocodes';
import { formatPrice, formatDateTime } from '@/utils/format';

/**
 * Страница баланса
 */
const Balance = () => {
    const { t } = useTranslation();
    const { hapticFeedback, hapticNotification, showAlert, openLink } = useTelegram();
    const { subscription, loadSubscription } = useSubscription();
    const { methods, loadPaymentMethods, initiatePayment } = usePayments();

    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [promoCode, setPromoCode] = useState<string>('');
    const [activating, setActivating] = useState(false);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                await loadPaymentMethods();
                await loadSubscription();
            } catch (err) {
                console.error('Error initializing balance page:', err);
            }
        };
        init();
    }, []);

    const handleMethodSelect = (methodId: string) => {
        hapticFeedback('light');
        setSelectedMethod(methodId);
    };

    const handlePay = async () => {
        if (!selectedMethod) return;

        const method = methods.find(m => m.id === selectedMethod);
        if (!method) return;

        // Проверяем сумму для методов, которые требуют ввод суммы
        if (method.requires_amount) {
            const amountValue = parseFloat(amount);
            if (!amount || isNaN(amountValue) || amountValue <= 0) {
                showAlert('Пожалуйста, введите корректную сумму');
                return;
            }
        }

        setPaying(true);
        hapticFeedback('medium');

        try {
            const amountKopeks = method.requires_amount ? Math.round(parseFloat(amount) * 100) : undefined;
            const result = await initiatePayment(selectedMethod, amountKopeks);

            if (result.payment_url) {
                openLink(result.payment_url);
            }

            hapticNotification('success');
        } catch (err: any) {
            hapticNotification('error');
            showAlert(err.message || 'Ошибка создания платежа');
        } finally {
            setPaying(false);
        }
    };

    const handleActivatePromo = async () => {
        if (!promoCode.trim()) return;

        setActivating(true);
        hapticFeedback('medium');

        try {
            const result = await activatePromoCode(promoCode);
            hapticNotification('success');
            showAlert(result.description || t('balance.promocode.success'), () => {
                setPromoCode('');
                loadSubscription();
            });
        } catch (err: any) {
            hapticNotification('error');
            showAlert(err.message || t('balance.promocode.error'));
        } finally {
            setActivating(false);
        }
    };

    const balance = subscription?.balance_kopeks || 0;
    const transactions = subscription?.transactions || [];

    return (
        <>
            <Header title={t('balance.title')} showBack />

            <Container>
                {/* Текущий баланс */}
                <Card className="mb-4 text-center">
                    <p className="text-tg-hint mb-2">{t('balance.current')}</p>
                    <p className="text-4xl font-bold text-tg-link">{formatPrice(balance)}</p>
                </Card>

                {/* Промокод */}
                <Card className="mb-4">
                    <h3 className="font-semibold mb-3">{t('balance.promocode.title')}</h3>
                    <div className="flex gap-2">
                        <Input
                            placeholder={t('balance.promocode.placeholder')}
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            className="flex-1"
                        />
                        <Button
                            variant="primary"
                            onClick={handleActivatePromo}
                            isLoading={activating}
                            disabled={!promoCode.trim()}
                        >
                            {t('balance.promocode.activate')}
                        </Button>
                    </div>
                </Card>

                {/* Способы оплаты */}
                <h2 className="text-lg font-semibold mb-3">{t('balance.selectMethod')}</h2>

                <div className="space-y-3 mb-4">
                    {methods.map((method) => (
                        <Card
                            key={method.id}
                            hover
                            onClick={() => handleMethodSelect(method.id)}
                            className={`cursor-pointer ${selectedMethod === method.id ? 'ring-2 ring-tg-link' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {method.icon && <span className="text-2xl">{method.icon}</span>}
                                <span className="flex-1 font-medium">{method.id}</span>
                                <span className="text-sm text-tg-hint">{method.currency}</span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Ввод суммы */}
                {selectedMethod && methods.find(m => m.id === selectedMethod)?.requires_amount && (
                    <Card className="mb-4">
                        <Input
                            type="number"
                            label={t('balance.enterAmount')}
                            placeholder="100"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </Card>
                )}

                {/* Кнопка оплаты */}
                {selectedMethod && (
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={paying}
                        onClick={handlePay}
                    >
                        {t('balance.pay')}
                    </Button>
                )}

                {/* История транзакций */}
                {transactions.length > 0 && (
                    <>
                        <h2 className="text-lg font-semibold mt-6 mb-3">{t('balance.history')}</h2>
                        <div className="space-y-2">
                            {transactions.slice(0, 10).map((tx) => (
                                <Card key={tx.id} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium">{tx.description || tx.type}</p>
                                        <p className="text-xs text-tg-hint">{formatDateTime(tx.created_at)}</p>
                                    </div>
                                    <p className={`font-bold ${tx.amount_kopeks > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {tx.amount_kopeks > 0 ? '+' : ''}{formatPrice(tx.amount_kopeks)}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </Container>
        </>
    );
};

export default Balance;

