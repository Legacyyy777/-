// Фон с частицами (упрощенная версия без heavy библиотек)

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';

/**
 * Простой фон с частицами на canvas
 */
const ParticlesBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { enableParticles } = useUIStore();

    useEffect(() => {
        if (!enableParticles || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Размеры canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Частицы
        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
        }> = [];

        // Создание частиц (увеличено количество)
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
            });
        }

        // Анимация
        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                // Обновление позиции
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Граничные условия
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Отрисовка частицы
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(36, 129, 204, 0.5)';
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Изменение размера
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, [enableParticles]);

    if (!enableParticles) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none opacity-50"
        />
    );
};

export default ParticlesBackground;

