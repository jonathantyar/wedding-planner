import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function calculateBudgetBreakdown(items: any[]): { total: number; paid: number; remaining: number } {
    let total = 0;
    let paid = 0;

    items.forEach(item => {
        const itemTotal = item.count * item.price;
        if (itemTotal >= 0) {
            total += itemTotal;
        } else {
            paid += Math.abs(itemTotal);
        }
    });

    return {
        total,
        paid,
        remaining: total - paid
    };
}
