import React from 'react';
import { cn } from '../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block md:text-sm text-xs font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    'w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all duration-200 bg-white/80 backdrop-blur-sm',
                    error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200',
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 md:text-sm text-xs text-red-600">{error}</p>}
        </div>
    );
};
