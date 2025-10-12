// Компонент для анимированных переходов между страницами

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: ReactNode;
}

/**
 * Wrapper для анимированных переходов между страницами
 */
const PageTransition = ({ children }: PageTransitionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                duration: 0.3,
                ease: 'easeInOut',
            }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;

