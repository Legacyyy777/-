// Контейнер для контента страницы

import { ReactNode } from 'react';

interface ContainerProps {
    children: ReactNode;
    className?: string;
}

/**
 * Контейнер для контента с максимальной шириной и padding
 */
const Container = ({ children, className = '' }: ContainerProps) => {
    return (
        <div className={`max-w-screen-lg mx-auto px-4 py-4 ${className}`}>
            {children}
        </div>
    );
};

export default Container;

