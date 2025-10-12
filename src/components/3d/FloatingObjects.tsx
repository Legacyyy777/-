// Крутые плавающие объекты с градиентами и эффектами

// Убрал motion - используем простые div
import { useUIStore } from '@/store/uiStore';

/**
 * Плавающие геометрические объекты с крутыми эффектами
 */
const FloatingObjects = () => {
    const { enable3D } = useUIStore();

    if (!enable3D) return null;

    // Максимально простые градиенты для быстрой сборки
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.2, zIndex: 1 }}>
            {/* Круг 1 - Синий */}
            {/* Только 2 простых градиента для скорости */}
            <div
                className="absolute w-[200px] h-[200px] rounded-full bg-blue-500/10 blur-xl"
                style={{ top: '20%', left: '20%' }}
            />
            <div
                className="absolute w-[150px] h-[150px] rounded-full bg-purple-500/10 blur-xl"
                style={{ bottom: '20%', right: '20%' }}
            />
        </div>
    );
};

export default FloatingObjects;

