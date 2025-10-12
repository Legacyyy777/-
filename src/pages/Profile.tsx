// Страница профиля пользователя

import { useEffect } from 'react';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';
import { useSubscription } from '@/hooks/useSubscription';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { LANGUAGES, setLanguage as setAppLanguage } from '@/i18n';
import { formatPrice } from '@/utils/format';

/**
 * Страница профиля
 */
const Profile = () => {
    const { t, language } = useTranslation();
    const { user } = useTelegram();
    const { subscription, loadSubscription } = useSubscription();
    const { theme, toggleTheme, enable3D, enableParticles, toggle3D, toggleParticles } = useUIStore();
    const { setLanguage } = useAuthStore();
    const { hapticFeedback } = useTelegram();

    useEffect(() => {
        loadSubscription();
    }, []);

    const handleLanguageChange = (lang: string) => {
        hapticFeedback('light');
        setLanguage(lang);
        setAppLanguage(lang as any);
        window.location.reload(); // Перезагрузка для применения языка
    };

    const handleThemeToggle = () => {
        hapticFeedback('light');
        toggleTheme();
    };

    const handle3DToggle = () => {
        hapticFeedback('light');
        toggle3D();
    };

    const handleParticlesToggle = () => {
        hapticFeedback('light');
        toggleParticles();
    };

    return (
        <>
            <Header title={t('profile.title')} showBack />

            <Container>
                {/* Информация о пользователе */}
                <Card className="mb-4">
                    <h3 className="font-semibold mb-3">{t('profile.user.title')}</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-tg-hint">{t('profile.user.id')}</span>
                            <span className="font-medium">{user?.id}</span>
                        </div>
                        {user?.username && (
                            <div className="flex justify-between">
                                <span className="text-tg-hint">{t('profile.user.username')}</span>
                                <span className="font-medium">@{user.username}</span>
                            </div>
                        )}
                        {user?.is_premium && (
                            <div className="flex justify-between">
                                <span className="text-tg-hint">{t('profile.user.premium')}</span>
                                <span className="text-xl">⭐</span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Статистика */}
                {subscription && (
                    <Card className="mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-tg-hint">{t('profile.totalSpent')}</span>
                            <span className="text-2xl font-bold text-tg-link">
                                {formatPrice(subscription.total_spent_kopeks)}
                            </span>
                        </div>
                    </Card>
                )}

                {/* Настройки приложения */}
                <Card className="mb-4">
                    <h3 className="font-semibold mb-3">{t('profile.settings.title')}</h3>

                    {/* Язык */}
                    <div className="mb-4">
                        <p className="text-sm text-tg-hint mb-2">{t('profile.settings.language')}</p>
                        <div className="flex gap-2">
                            {Object.entries(LANGUAGES).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => handleLanguageChange(code)}
                                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${language === code
                                        ? 'bg-tg-link text-white'
                                        : 'bg-tg-secondaryBg text-tg-text hover:opacity-80'
                                        }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Тема */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="font-medium">{t('profile.settings.theme')}</p>
                            <p className="text-sm text-tg-hint">
                                {theme === 'dark' ? t('profile.settings.dark') : t('profile.settings.light')}
                            </p>
                        </div>
                        <button
                            onClick={handleThemeToggle}
                            className={`relative w-14 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform flex items-center justify-center ${theme === 'dark' ? 'translate-x-6' : ''
                                    }`}
                            >
                                {theme === 'dark' ? '🌙' : '☀️'}
                            </span>
                        </button>
                    </div>

                    {/* 3D эффекты */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="font-medium">{t('profile.settings.effects.3d')}</p>
                            <p className="text-sm text-tg-hint">Плавающие объекты на фоне</p>
                        </div>
                        <button
                            onClick={handle3DToggle}
                            className={`relative w-14 h-8 rounded-full transition-colors ${enable3D ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${enable3D ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Частицы */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{t('profile.settings.effects.particles')}</p>
                            <p className="text-sm text-tg-hint">Анимированные частицы</p>
                        </div>
                        <button
                            onClick={handleParticlesToggle}
                            className={`relative w-14 h-8 rounded-full transition-colors ${enableParticles ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${enableParticles ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>
                </Card>
            </Container>
        </>
    );
};

export default Profile;

