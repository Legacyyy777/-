// Компонент загрузки с анимацией

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

/**
 * Анимированный spinner загрузки
 */
const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
                className={`${sizeClasses[size]} border-4 border-tg-hint/30 border-t-tg-link rounded-full`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
            {text && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-tg-hint text-sm"
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export default LoadingSpinner;

