// Заголовок страницы

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';

interface HeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    rightAction?: ReactNode;
}

/**
 * Компонент заголовка страницы
 * Опционально отображает кнопку "Назад" и правое действие
 */
const Header = ({ title, subtitle, showBack, rightAction }: HeaderProps) => {
    const navigate = useNavigate();
    const { hapticFeedback } = useTelegram();

    const handleBack = () => {
        hapticFeedback('light');
        navigate(-1);
    };

    return (
        <header className="sticky top-0 z-40 bg-tg-bg/95 backdrop-blur-sm border-b border-tg-hint/10">
            <div className="max-w-screen-lg mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    {showBack && (
                        <button
                            onClick={handleBack}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-tg-secondaryBg hover:opacity-80 transition-opacity active:scale-95"
                            aria-label="Назад"
                        >
                            <span className="text-lg">←</span>
                        </button>
                    )}

                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-tg-text">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-tg-hint mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>

                {rightAction && <div className="ml-3">{rightAction}</div>}
            </div>
        </header>
    );
};

export default Header;

