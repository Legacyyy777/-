// Хук для анимации счётчика (цифры увеличиваются от 0)

import { useEffect, useState } from 'react';

/**
 * Анимация увеличения числа от 0 до target
 * @param target - целевое значение
 * @param duration - длительность анимации в мс
 * @returns текущее анимированное значение
 */
export const useCountUp = (target: number, duration: number = 1500): number => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function для плавности (easeOutQuart)
            const easeOut = 1 - Math.pow(1 - progress, 4);

            setCount(Math.floor(target * easeOut));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(target); // Устанавливаем точное значение в конце
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [target, duration]);

    return count;
};

