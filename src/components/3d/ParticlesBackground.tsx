// Звёздное небо с мерцающими частицами

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  twinkle: number;
}

/**
 * Звёздное небо с мерцающими частицами
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
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Создание частиц - звёздное небо
    const particles: Particle[] = [];
    const particleCount = 50; // Меньше, но красивее

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0, // Статичные звёзды
        vy: 0,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2, // Фаза мерцания
      });
    }

    // Анимация
    let animationId: number;
    const animate = () => {
      // Тёмный фон для звёзд
      ctx.fillStyle = 'rgba(15, 23, 42, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      particles.forEach((particle) => {
        // Мерцание звёзд
        const twinkle = Math.sin(time * 2 + particle.twinkle) * 0.5 + 0.5;
        const currentOpacity = particle.opacity * (0.3 + twinkle * 0.7);

        // Отрисовка звезды
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Свечение для больших звёзд
        if (particle.size > 1.5) {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.3})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Обработчик изменения размера
    const handleResize = () => {
      setCanvasSize();
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
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        opacity: 0.8
      }}
    />
  );
};

export default ParticlesBackground;