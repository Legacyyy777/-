// Плавающие CSS объекты (легковесная альтернатива Three.js)

import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';

/**
 * Плавающие геометрические объекты на CSS
 */
const FloatingObjects = () => {
    const { enable3D } = useUIStore();

    if (!enable3D) return null;

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-10">
            {/* Круг 1 */}
            <motion.div
                className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-tg-link to-blue-600 blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    top: '10%',
                    left: '10%',
                }}
            />

            {/* Круг 2 */}
            <motion.div
                className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 blur-3xl"
                animate={{
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    bottom: '10%',
                    right: '10%',
                }}
            />

            {/* Квадрат */}
            <motion.div
                className="absolute w-48 h-48 bg-gradient-to-br from-green-500 to-teal-500 blur-3xl"
                animate={{
                    rotate: [0, 180, 360],
                    x: [0, 50, 0],
                    y: [0, -100, 0],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />
        </div>
    );
};

export default FloatingObjects;

