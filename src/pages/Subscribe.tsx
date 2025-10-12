// Страница покупки подписки

import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import { useTranslation } from '@/i18n';

/**
 * Страница покупки подписки
 * TODO: Полная реализация с выбором тарифа, серверов, трафика
 */
const Subscribe = () => {
    const { t } = useTranslation();

    return (
        <>
            <Header title={t('subscribe.title')} showBack />

            <Container>
                <div className="card text-center py-12">
                    <p className="text-4xl mb-4">📦</p>
                    <h2 className="text-xl font-semibold mb-2">{t('subscribe.title')}</h2>
                    <p className="text-tg-hint">
                        {t('common.loading')}...
                    </p>
                </div>
            </Container>
        </>
    );
};

export default Subscribe;

