// Страница помощи и FAQ

import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import { useTranslation } from '@/i18n';

/**
 * Страница помощи
 * TODO: FAQ, инструкции, юридические документы
 */
const Help = () => {
    const { t } = useTranslation();

    return (
        <>
            <Header title={t('help.title')} showBack />

            <Container>
                <div className="card text-center py-12">
                    <p className="text-4xl mb-4">❓</p>
                    <h2 className="text-xl font-semibold mb-2">{t('help.title')}</h2>
                    <p className="text-tg-hint">
                        {t('common.loading')}...
                    </p>
                </div>
            </Container>
        </>
    );
};

export default Help;

