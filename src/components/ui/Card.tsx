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
        default: 'bg-white/10 backdrop-blur-sm border border-white/20',
        elevated: 'bg-white/15 backdrop-blur-md border border-white/30 shadow-lg',
        glass: 'bg-white/5 backdrop-blur-lg border border-white/10',
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

