import React from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import type { WeddingPlan } from '../types';
import { formatCurrency } from '../lib/utils';

interface BudgetChartProps {
    currentPlan: WeddingPlan;
    groupBy: 'vendor' | 'tag';
    chartType: 'bar' | 'pie';
}

const COLORS = ['#4338ca', '#6366f1', '#818cf8', '#a5b4fc', '#3b82f6', '#60a5fa', '#93c5fd'];

export const BudgetChart: React.FC<BudgetChartProps> = ({ currentPlan, groupBy, chartType }) => {
    const getChartData = () => {
        if (groupBy === 'vendor') {
            // Group by vendors
            return currentPlan.vendors
                .map(vendor => {
                    if (!vendor.selected) return null;

                    const total = vendor.useSum
                        ? vendor.tags.reduce((sum, tag) => {
                            if (!tag.selected) return sum;
                            const tagTotal = tag.useSum
                                ? tag.items
                                    .filter(item => item.selected)
                                    .reduce((s, item) => s + item.count * item.price, 0)
                                : tag.manualTotal;
                            return sum + tagTotal;
                        }, 0)
                        : vendor.manualTotal;

                    return total > 0 ? { name: vendor.name, value: total } : null;
                })
                .filter(Boolean) as { name: string; value: number }[];
        } else {
            // Group by tag names (aggregate across all vendors)
            const tagMap = new Map<string, number>();

            currentPlan.vendors.forEach(vendor => {
                if (!vendor.selected) return;

                vendor.tags.forEach(tag => {
                    if (!tag.selected) return;

                    const tagTotal = tag.useSum
                        ? tag.items
                            .filter(item => item.selected)
                            .reduce((sum, item) => sum + item.count * item.price, 0)
                        : tag.manualTotal;

                    if (tagTotal > 0) {
                        tagMap.set(tag.name, (tagMap.get(tag.name) || 0) + tagTotal);
                    }
                });
            });

            return Array.from(tagMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
        }
    };

    const data = getChartData();

    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm">
                No data to display. Select some items to see the breakdown.
            </div>
        );
    }

    return (
        <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                    <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                ) : (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            isAnimationActive={false}
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '11px' }}
                            iconType="circle"
                        />
                    </PieChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};
