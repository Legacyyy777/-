// Страница профиля пользователя

import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import { useTranslation } from '@/i18n';

/**
 * Страница профиля
 * TODO: Настройки приложения, информация о пользователе
 */
const Profile = () => {
    const { t } = useTranslation();

    return (
        <>
            <Header title={t('profile.title')} showBack />

            <Container>
                <div className="card text-center py-12">
                    <p className="text-4xl mb-4">👤</p>
                    <h2 className="text-xl font-semibold mb-2">{t('profile.title')}</h2>
                    <p className="text-tg-hint">
                        {t('common.loading')}...
                    </p>
                </div>
            </Container>
        </>
    );
};

export default Profile;

