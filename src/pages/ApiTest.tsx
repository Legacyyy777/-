// Страница для тестирования API эндпоинтов

import { useState } from 'react';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';
import { getSubscription, getPurchaseOptions } from '@/api/subscriptions';
import { getReferralInfo } from '@/api/referrals';
import { getPaymentMethods } from '@/api/payments';

const ApiTest = () => {
    const { t } = useTranslation();
    const { showAlert } = useTelegram();
    const [results, setResults] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
        setLoading(prev => ({ ...prev, [name]: true }));
        try {
            const result = await testFn();
            setResults(prev => ({ ...prev, [name]: { success: true, data: result } }));
            showAlert(`${name}: Успешно!`);
        } catch (error: any) {
            setResults(prev => ({ ...prev, [name]: { success: false, error: error.message } }));
            showAlert(`${name}: Ошибка - ${error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [name]: false }));
        }
    };

    const testEndpoints = [
        { name: 'getSubscription', fn: () => getSubscription() },
        { name: 'getPurchaseOptions', fn: () => getPurchaseOptions() },
        { name: 'getReferralInfo', fn: () => getReferralInfo() },
        { name: 'getPaymentMethods', fn: () => getPaymentMethods() },
    ];

    return (
        <Container>
            <Header title="API Тест" />
            
            <div className="space-y-4">
                <Card>
                    <h2 className="text-lg font-semibold mb-4">Тестирование API эндпоинтов</h2>
                    
                    <div className="space-y-3">
                        {testEndpoints.map(({ name, fn }) => (
                            <div key={name} className="flex items-center justify-between p-3 bg-tg-secondary-bg rounded-lg">
                                <span className="font-medium">{name}</span>
                                <div className="flex items-center gap-2">
                                    {results[name] && (
                                        <span className={`text-sm ${results[name].success ? 'text-green-500' : 'text-red-500'}`}>
                                            {results[name].success ? '✓' : '✗'}
                                        </span>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => testEndpoint(name, fn)}
                                        disabled={loading[name]}
                                    >
                                        {loading[name] ? 'Тест...' : 'Тест'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {Object.keys(results).length > 0 && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Результаты тестов</h3>
                        <div className="space-y-3">
                            {Object.entries(results).map(([name, result]) => (
                                <div key={name} className="p-3 bg-tg-secondary-bg rounded-lg">
                                    <h4 className="font-medium mb-2">{name}</h4>
                                    <pre className="text-xs bg-black/20 p-2 rounded overflow-auto max-h-32">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </Container>
    );
};

export default ApiTest;
