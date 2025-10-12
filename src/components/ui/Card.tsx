// Компонент карточки

import { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

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

    const CardComponent = hover ? motion.div : 'div';
    const hoverProps = hover
        ? {
            whileHover: { scale: 1.02, y: -2 },
            transition: { duration: 0.2 },
        }
        : {};

    return (
        <CardComponent
            className={`
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        rounded-xl
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
            {...hoverProps}
            {...props}
        >
            {children}
        </CardComponent>
    );
};

export default Card;

