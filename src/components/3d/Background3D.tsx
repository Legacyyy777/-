// Простой 3D фон с плавающими объектами

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { useUIStore } from '@/store/uiStore';

/**
 * Плавающий куб с анимацией
 */
function FloatingCube({ position }: { position: [number, number, number] }) {
    return (
        <mesh position={position} rotation={[0.5, 0.5, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#2481cc" wireframe />
        </mesh>
    );
}

/**
 * 3D фон с плавающими геометрическими объектами
 */
const Background3D = () => {
    const { enable3D } = useUIStore();

    // Если 3D отключен, не рендерим
    if (!enable3D) return null;

    return (
        <div className="fixed inset-0 -z-10 opacity-20">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <Suspense fallback={null}>
                    {/* Освещение */}
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />

                    {/* Плавающие объекты */}
                    <FloatingCube position={[-2, 1, 0]} />
                    <FloatingCube position={[2, -1, 0]} />
                    <FloatingCube position={[0, 2, -2]} />

                    {/* Контроллы (опционально) */}
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Background3D;

