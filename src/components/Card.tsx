import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
    return (
        <div
            className={cn(
                'glass rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
