// Страница реферальной программы

import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import { useTranslation } from '@/i18n';

/**
 * Страница реферальной системы
 * TODO: Статистика, список рефералов, история заработка
 */
const Referral = () => {
    const { t } = useTranslation();

    return (
        <>
            <Header title={t('referral.title')} showBack />

            <Container>
                <div className="card text-center py-12">
                    <p className="text-4xl mb-4">👥</p>
                    <h2 className="text-xl font-semibold mb-2">{t('referral.title')}</h2>
                    <p className="text-tg-hint">
                        {t('common.loading')}...
                    </p>
                </div>
            </Container>
        </>
    );
};

export default Referral;

