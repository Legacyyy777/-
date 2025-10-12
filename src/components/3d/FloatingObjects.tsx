// Простые плавающие градиенты без Three.js

import { useUIStore } from '@/store/uiStore';

/**
 * Легкие плавающие градиенты
 */
const FloatingObjects = () => {
    const { enable3D } = useUIStore();

    if (!enable3D) return null;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.3, zIndex: 1 }}>
            {/* Простые градиентные круги */}
            <div
                className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse"
                style={{ top: '10%', left: '10%', animationDuration: '4s' }}
            />
            <div
                className="absolute w-[250px] h-[250px] rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse"
                style={{ bottom: '15%', right: '15%', animationDuration: '5s', animationDelay: '1s' }}
            />
            <div
                className="absolute w-[200px] h-[200px] rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl animate-pulse"
                style={{ top: '50%', right: '20%', animationDuration: '6s', animationDelay: '2s' }}
            />
        </div>
    );
};

export default FloatingObjects;

