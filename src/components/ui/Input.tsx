// Компонент input с валидацией

import { InputHTMLAttributes, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

/**
 * Input поле с валидацией и анимациями
 */
const Input = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    ...props
}: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`w-full ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-tg-text mb-2">
                    {label}
                </label>
            )}

            {/* Input wrapper */}
            <div className="relative">
                {/* Left icon */}
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint">
                        {leftIcon}
                    </div>
                )}

                {/* Input */}
                <input
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
            w-full
            px-4 py-3
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            rounded-lg
            bg-tg-secondaryBg
            text-tg-text
            border-2
            ${error ? 'border-red-500' : isFocused ? 'border-tg-link' : 'border-transparent'}
            outline-none
            transition-colors
            placeholder:text-tg-hint
          `}
                    {...props}
                />

                {/* Right icon */}
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-tg-hint">
                        {rightIcon}
                    </div>
                )}
            </div>

            {/* Error or Helper text */}
            <AnimatePresence mode="wait">
                {error ? (
                    <motion.p
                        key="error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 mt-1"
                    >
                        {error}
                    </motion.p>
                ) : helperText ? (
                    <motion.p
                        key="helper"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-tg-hint mt-1"
                    >
                        {helperText}
                    </motion.p>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default Input;

