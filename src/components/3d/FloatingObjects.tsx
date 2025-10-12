// Крутые плавающие объекты с градиентами и эффектами

// Убрал motion - используем простые div
import { useUIStore } from '@/store/uiStore';

/**
 * Плавающие геометрические объекты с крутыми эффектами
 */
const FloatingObjects = () => {
    const { enable3D } = useUIStore();

    if (!enable3D) return null;

    // Упрощённые статичные градиенты вместо анимации

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.4, zIndex: 1 }}>
            {/* Круг 1 - Синий */}
            <div
                className="absolute w-[400px] h-[400px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(37,99,235,0.2) 50%, transparent 70%)',
                    filter: 'blur(60px)',
                    top: '10%',
                    left: '10%',
                }}
            />

            {/* Круг 2 - Фиолетовый */}
            <div
                className="absolute w-[300px] h-[300px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(236,72,153,0.2) 50%, transparent 70%)',
                    filter: 'blur(60px)',
                    bottom: '10%',
                    right: '10%',
                }}
            />

            {/* Круг 3 - Зелёный */}
            <div
                className="absolute w-[350px] h-[350px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(5,150,105,0.2) 50%, transparent 70%)',
                    filter: 'blur(60px)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />

            {/* Круг 4 - Оранжевый */}
            <div
                className="absolute w-[250px] h-[250px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(251,146,60,0.3) 0%, rgba(239,68,68,0.2) 50%, transparent 70%)',
                    filter: 'blur(60px)',
                    top: '70%',
                    left: '20%',
                }}
            />
        </div>
    );
};

export default FloatingObjects;

