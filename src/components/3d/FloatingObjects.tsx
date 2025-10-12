// Крутые плавающие объекты с градиентами и эффектами

import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';

/**
 * Плавающие геометрические объекты с крутыми эффектами
 */
const FloatingObjects = () => {
    const { enable3D } = useUIStore();

    if (!enable3D) return null;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.8, zIndex: 1 }}>
            {/* Круг 1 - Синий */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(37,99,235,0.4) 50%, transparent 70%)',
                    filter: 'blur(100px)',
                    top: '5%',
                    left: '5%',
                }}
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
            />

            {/* Круг 2 - Фиолетовый */}
            <motion.div
                className="absolute w-[700px] h-[700px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.9) 0%, rgba(236,72,153,0.5) 50%, transparent 70%)',
                    filter: 'blur(100px)',
                    bottom: '5%',
                    right: '5%',
                }}
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
            />

            {/* Круг 3 - Зелёный */}
            <motion.div
                className="absolute w-[550px] h-[550px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(16,185,129,0.8) 0%, rgba(5,150,105,0.4) 50%, transparent 70%)',
                    filter: 'blur(100px)',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
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
            />

            {/* Круг 4 - Оранжевый */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(251,146,60,0.8) 0%, rgba(239,68,68,0.4) 50%, transparent 70%)',
                    filter: 'blur(100px)',
                    top: '60%',
                    left: '20%',
                }}
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
            />
        </div>
    );
};

export default FloatingObjects;

