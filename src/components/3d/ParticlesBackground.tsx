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

    // Максимально простые частицы для быстрой сборки
    const particles: Particle[] = [];
    const particleCount = 15; // Очень мало для скорости

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
      // Простая очистка
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Простые статичные точки без анимации
      particles.forEach((particle) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
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