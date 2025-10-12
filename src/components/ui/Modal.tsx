// Компонент модального окна

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '@/hooks/useTelegram';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    showCloseButton?: boolean;
}

/**
 * Модальное окно с анимациями
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
}: ModalProps) => {
    const { hapticFeedback } = useTelegram();

    // Блокируем скролл body когда модалка открыта
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Размеры модалки
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };

    const handleClose = () => {
        hapticFeedback('light');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`
                w-full ${sizeClasses[size]}
                bg-tg-bg
                rounded-2xl
                shadow-xl
                overflow-hidden
              `}
                        >
                            {/* Header */}
                            {(title || showCloseButton) && (
                                <div className="flex items-center justify-between p-4 border-b border-tg-hint/10">
                                    <h3 className="text-lg font-semibold text-tg-text">
                                        {title}
                                    </h3>
                                    {showCloseButton && (
                                        <button
                                            onClick={handleClose}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-tg-secondaryBg transition-colors"
                                        >
                                            <span className="text-xl">×</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-4 max-h-[70vh] overflow-y-auto">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;

