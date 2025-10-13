// Нижняя панель навигации

import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';

/**
 * Нижняя панель навигации с иконками
 */
const TabBar = () => {
    const { t } = useTranslation();
    const { hapticSelection } = useTelegram();
    const location = useLocation();

    // Навигационные элементы
    const navItems = [
        { path: '/', label: t('navigation.home'), icon: '🏠' },
        { path: '/subscribe', label: t('navigation.subscribe'), icon: '📦' },
        { path: '/balance', label: t('navigation.balance'), icon: '💰' },
        { path: '/referral', label: t('navigation.referral'), icon: '👥' },
        { path: '/profile', label: t('navigation.profile'), icon: '👤' },
    ];

    // Находим индекс активного элемента
    const activeIndex = navItems.findIndex(item => item.path === location.pathname);

    return (
        <nav className="fixed bottom-4 left-4 right-4 safe-area-inset-bottom z-50">
            {/* Liquid Glass Background */}
            <div className="liquid-glass rounded-3xl overflow-hidden relative">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 animate-liquidGlow opacity-50"></div>

                {/* Moving selection mask */}
                <div
                    className="liquid-glass-active absolute top-1 bottom-1 rounded-xl transition-all duration-500 ease-out"
                    style={{
                        left: `${(100 / navItems.length) * activeIndex + 2}%`,
                        width: `${96 / navItems.length}%`,
                        transform: activeIndex >= 0 ? 'translateX(0)' : 'translateX(-100%)'
                    }}
                />

                {/* Navigation items */}
                <div className="relative flex justify-around items-center h-16 px-2">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => hapticSelection()}
                            className={`relative flex flex-col items-center justify-center w-full h-full transition-colors duration-300 rounded-2xl z-10 ${activeIndex === index
                                ? 'text-white'
                                : 'text-white/70 hover:text-white'
                                }`}
                        >
                            {/* Icon */}
                            <span className={`text-2xl mb-0.5 transition-all duration-300 ${activeIndex === index ? 'drop-shadow-lg filter brightness-110 scale-110' : 'scale-100'
                                }`}>
                                {item.icon}
                            </span>

                            {/* Label */}
                            <span className="text-xs font-medium transition-all duration-300">
                                {item.label}
                            </span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default TabBar;

