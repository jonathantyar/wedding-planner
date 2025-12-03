import React from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, ...props }) => {
    const formatNumber = (num: string): string => {
        // Remove all non-digit characters
        const digits = num.replace(/\D/g, '');
        if (!digits) return '';

        // Format with thousand separators
        return parseInt(digits).toLocaleString('id-ID');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '');
        onChange(digits);
    };

    const displayValue = formatNumber(value);

    return (
        <input
            {...props}
            type="text"
            value={displayValue}
            onChange={handleChange}
            inputMode="numeric"
        />
    );
};
