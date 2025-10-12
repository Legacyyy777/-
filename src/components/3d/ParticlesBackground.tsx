// Легкое звёздное небо без тяжелых библиотек

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';

/**
 * Простое звёздное небо
 */
const ParticlesBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { enableParticles } = useUIStore();

    useEffect(() => {
        if (!enableParticles || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Устанавливаем размеры
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();

        // Создаем звезды (только позиции, без движения)
        const stars = Array.from({ length: 50 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.3,
        }));

        // Простая отрисовка без анимации
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        draw();

        // Перерисовка при изменении размера
        window.addEventListener('resize', () => {
            resize();
            // Обновляем позиции звезд
            stars.forEach(star => {
                star.x = Math.random() * canvas.width;
                star.y = Math.random() * canvas.height;
            });
            draw();
        });

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [enableParticles]);

    if (!enableParticles) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 1, opacity: 0.6 }}
        />
    );
};

export default ParticlesBackground;

