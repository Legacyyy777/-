// Нижняя панель навигации

import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';

/**
 * Нижняя панель навигации с иконками
 */
const TabBar = () => {
    const { t } = useTranslation();
    const { hapticSelection } = useTelegram();

    // Навигационные элементы
    const navItems = [
        { path: '/', label: t('navigation.home'), icon: '🏠' },
        { path: '/subscribe', label: t('navigation.subscribe'), icon: '📦' },
        { path: '/balance', label: t('navigation.balance'), icon: '💰' },
        { path: '/referral', label: t('navigation.referral'), icon: '👥' },
        { path: '/profile', label: t('navigation.profile'), icon: '👤' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-tg-secondaryBg border-t border-tg-hint/20 safe-area-inset-bottom z-50">
            <div className="flex justify-around items-center h-16 max-w-screen-lg mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => hapticSelection()}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full h-full transition-colors ${isActive
                                ? 'text-tg-link'
                                : 'text-tg-hint hover:text-tg-text'
                            }`
                        }
                    >
                        <span className="text-2xl mb-0.5">{item.icon}</span>
                        <span className="text-xs font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default TabBar;

