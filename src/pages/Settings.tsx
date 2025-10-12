// Страница настроек подписки

import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import { useTranslation } from '@/i18n';

/**
 * Страница настроек подписки
 * TODO: Управление серверами, трафиком, устройствами
 */
const Settings = () => {
    const { t } = useTranslation();

    return (
        <>
            <Header title={t('settings.title')} showBack />

            <Container>
                <div className="card text-center py-12">
                    <p className="text-4xl mb-4">⚙️</p>
                    <h2 className="text-xl font-semibold mb-2">{t('settings.title')}</h2>
                    <p className="text-tg-hint">
                        {t('common.loading')}...
                    </p>
                </div>
            </Container>
        </>
    );
};

export default Settings;

