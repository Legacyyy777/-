// Компонент карточки

import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: 'default' | 'elevated' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

/**
 * Карточка с различными вариантами стилей
 */
const Card = ({
    children,
    variant = 'default',
    padding = 'md',
    hover = false,
    className = '',
    ...props
}: CardProps) => {
    // Стили вариантов
    const variantStyles = {
        default: 'bg-tg-secondaryBg',
        elevated: 'bg-tg-secondaryBg shadow-md',
        glass: 'glass dark:glass-dark',
    };

    // Стили padding
    const paddingStyles = {
        none: '',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
    };

    return (
        <div
            className={`
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        rounded-xl
        ${hover ? 'cursor-pointer hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md transform transition-all duration-200' : 'transition-all duration-150'}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;

