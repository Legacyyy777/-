// Продвинутый фон с частицами и интерактивностью

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

/**
 * Крутой фон с анимированными частицами
 */
const ParticlesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { enableParticles } = useUIStore();
  const mouseRef = useRef({ x: 0, y: 0 });

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

    // Цветовая палитра
    const colors = [
      'rgba(59, 130, 246, ',   // blue
      'rgba(139, 92, 246, ',   // purple
      'rgba(16, 185, 129, ',   // green
      'rgba(236, 72, 153, ',   // pink
      'rgba(251, 146, 60, ',   // orange
    ];

    // Создание частиц
    const particles: Particle[] = [];
    const particleCount = 150; // Больше частиц!

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    // Отслеживание мыши для интерактивности
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Анимация
    let animationId: number;
    const animate = () => {
      // Полупрозрачная очистка для эффекта следа
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Обновление позиции
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Граничные условия с плавным отскоком
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Интерактивность с мышью
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const force = (150 - dist) / 150;
          particle.vx -= (dx / dist) * force * 0.3;
          particle.vy -= (dy / dist) * force * 0.3;
        }

        // Пульсация размера
        const pulseSize = particle.size + Math.sin(Date.now() * 0.001 + index) * 0.5;

        // Отрисовка частицы с gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, pulseSize * 2
        );
        gradient.addColorStop(0, particle.color + particle.alpha + ')');
        gradient.addColorStop(1, particle.color + '0)');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Свечение вокруг частицы
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color + particle.alpha + ')';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + (particle.alpha * 0.8) + ')';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Связи между близкими частицами
        particles.forEach((other, otherIndex) => {
          if (otherIndex <= index) return;

          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const alpha = (1 - distance / 120) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Изменение размера
    const handleResize = () => {
      setCanvasSize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enableParticles]);

  if (!enableParticles) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        opacity: 0.8,
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default ParticlesBackground;

