import React from 'react';
import type { Guest } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GuestChartProps {
    guests: Guest[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const GuestChart: React.FC<GuestChartProps> = ({ guests }) => {
    // Only count selected guests
    const selectedGuests = guests.filter(g => g.selected);

    // Aggregate guests by tag
    const tagData = selectedGuests.reduce((acc, guest) => {
        const existing = acc.find(item => item.name === guest.tag);
        if (existing) {
            existing.value += guest.occupancy;
        } else {
            acc.push({ name: guest.tag, value: guest.occupancy });
        }
        return acc;
    }, [] as Array<{ name: string; value: number }>);

    if (tagData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                No guests yet
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={tagData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {tagData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} people`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};
