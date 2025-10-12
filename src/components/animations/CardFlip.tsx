// Компонент карточки с 3D flip анимацией

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface CardFlipProps {
    front: ReactNode;
    back: ReactNode;
    className?: string;
}

/**
 * Карточка с flip анимацией при клике
 */
const CardFlip = ({ front, back, className = '' }: CardFlipProps) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className={`relative w-full h-full cursor-pointer ${className}`}
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="relative w-full h-full"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                style={{
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Передняя сторона */}
                <div
                    className="absolute inset-0"
                    style={{
                        backfaceVisibility: 'hidden',
                    }}
                >
                    {front}
                </div>

                {/* Задняя сторона */}
                <div
                    className="absolute inset-0"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    {back}
                </div>
            </motion.div>
        </div>
    );
};

export default CardFlip;

