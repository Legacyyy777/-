// Компонент кнопки с анимациями

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTelegram } from '@/hooks/useTelegram';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

/**
 * Кнопка с анимациями и тактильным откликом
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    disabled,
    onClick,
    className = '',
    ...props
}: ButtonProps) => {
    const { hapticFeedback } = useTelegram();

    // Стили вариантов
    const variantStyles = {
        primary: 'bg-tg-button text-tg-buttonText hover:opacity-90',
        secondary: 'bg-tg-secondaryBg text-tg-text hover:opacity-80',
        outline: 'bg-transparent border-2 border-tg-button text-tg-button hover:bg-tg-button/10',
        danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    // Стили размеров
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled && !isLoading) {
            hapticFeedback('light');
            onClick?.(e);
        }
    };

    return (
        <motion.button
            whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
            {...props}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Загрузка...
                </>
            ) : (
                children
            )}
        </motion.button>
    );
};

export default Button;

