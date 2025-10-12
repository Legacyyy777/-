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
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-30">
            {/* Круг 1 - Синий */}
            <motion.div
                className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 blur-3xl"
                animate={{
                    x: [0, 150, 0],
                    y: [0, -80, 0],
                    scale: [1, 1.4, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    top: '5%',
                    left: '5%',
                }}
            />

            {/* Круг 2 - Фиолетовый */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500 to-pink-600 blur-3xl"
                animate={{
                    x: [0, -120, 0],
                    y: [0, 120, 0],
                    scale: [1, 1.5, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    bottom: '5%',
                    right: '5%',
                }}
            />

            {/* Круг 3 - Зелёный */}
            <motion.div
                className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-green-400 to-teal-600 blur-3xl"
                animate={{
                    rotate: [0, 180, 360],
                    x: [0, 80, 0],
                    y: [0, -120, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />

            {/* Круг 4 - Оранжевый */}
            <motion.div
                className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-orange-400 to-red-500 blur-3xl"
                animate={{
                    x: [0, -90, 0],
                    y: [0, 90, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    top: '60%',
                    left: '20%',
                }}
            />
        </div>
    );
};

export default FloatingObjects;

