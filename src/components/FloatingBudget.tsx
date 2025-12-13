import React from 'react';
import { useStore } from '../store';
import { BudgetChart } from './BudgetChart';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const FloatingBudget: React.FC = () => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [groupBy, setGroupBy] = React.useState<'vendor' | 'tag'>('vendor');
    const [chartType, setChartType] = React.useState<'bar' | 'pie'>('bar');
    const { currentPlan, calculateBudget, calculateBudgetBreakdown } = useStore();

    if (!currentPlan) return null;

    const budget = calculateBudget();

    return (
        <>
            {isExpanded && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsExpanded(false)} />
            )}
            <div className={`fixed z-50 transition-all duration-300 ${isExpanded ? 'bottom-0 left-0 right-0 md:bottom-8 md:left-auto md:right-8' : 'bottom-8 right-8'}`}>
                {isExpanded && (
                    <div className="glass md:rounded-2xl rounded-t-2xl p-6 shadow-2xl md:min-w-[350px] md:w-auto w-full animate-in slide-in-from-bottom max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-800">Budget Summary</h3>
                            <button onClick={() => setIsExpanded(false)} className="md:hidden p-2 text-gray-500">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {groupBy === 'vendor' ? (
                                // Group by Vendor
                                currentPlan.vendors.map((vendor) => {
                                    if (!vendor.selected) return null;

                                    const vendorTotal = vendor.useSum
                                        ? vendor.tags.reduce((sum, tag) => {
                                            if (!tag.selected) return sum;
                                            const tagTotal = tag.useSum
                                                ? tag.items.reduce((s, item) => {
                                                    if (!item.selected) return s;
                                                    return s + item.count * item.price;
                                                }, 0)
                                                : tag.manualTotal;
                                            return sum + tagTotal;
                                        }, 0)
                                        : vendor.manualTotal;

                                    if (vendorTotal === 0) return null;

                                    return (
                                        <div key={vendor.id} className="flex justify-between text-sm">
                                            <span className="text-gray-700">{vendor.name}</span>
                                            <span className="font-medium text-gray-900">
                                                {formatCurrency(vendorTotal)}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                // Group by Category (Tag)
                                (() => {
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
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([tagName, total]) => (
                                            <div key={tagName} className="flex justify-between text-sm">
                                                <span className="text-gray-700">{tagName}</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatCurrency(total)}
                                                </span>
                                            </div>
                                        ));
                                })()
                            )}

                            <div className="mt-4 mb-4">
                                <div className="flex gap-2 mb-2">
                                    <button
                                        onClick={() => setGroupBy('vendor')}
                                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${groupBy === 'vendor'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        By Vendor
                                    </button>
                                    <button
                                        onClick={() => setGroupBy('tag')}
                                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${groupBy === 'tag'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        By Category
                                    </button>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <button
                                        onClick={() => setChartType('bar')}
                                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${chartType === 'bar'
                                            ? 'bg-accent-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Bar Chart
                                    </button>
                                    <button
                                        onClick={() => setChartType('pie')}
                                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${chartType === 'pie'
                                            ? 'bg-accent-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Pie Chart
                                    </button>
                                </div>
                                <BudgetChart currentPlan={currentPlan} groupBy={groupBy} chartType={chartType} />

                                {/* Payments List */}
                                {(() => {
                                    const paymentItems: Array<{
                                        id: string;
                                        name: string;
                                        amount: number;
                                        groupName: string;
                                    }> = [];

                                    currentPlan.vendors.forEach(vendor => {
                                        if (!vendor.selected) return;
                                        vendor.tags.forEach(tag => {
                                            if (!tag.selected) return;
                                            tag.items.forEach(item => {
                                                if (item.selected && item.price < 0) {
                                                    paymentItems.push({
                                                        id: item.id,
                                                        name: item.name,
                                                        amount: Math.abs(item.count * item.price),
                                                        groupName: groupBy === 'vendor' ? vendor.name : tag.name
                                                    });
                                                }
                                            });
                                        });
                                    });

                                    if (paymentItems.length === 0) return null;

                                    return (
                                        <div className="mt-4 border-t border-gray-100 pt-3">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                Payments made ({groupBy === 'vendor' ? 'By Vendor' : 'By Category'})
                                            </h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                                {paymentItems.map(payment => (
                                                    <div key={payment.id} className="flex justify-between text-sm items-center bg-green-50/50 p-2 rounded">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-800 font-medium">{payment.name}</span>
                                                            <span className="text-xs text-gray-500">{payment.groupName}</span>
                                                        </div>
                                                        <span className="font-semibold text-green-600">
                                                            {formatCurrency(payment.amount)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="border-t-2 border-gray-200 pt-3 mt-2 grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Cost</p>
                                    <p className="font-semibold text-gray-800 text-sm md:text-base">
                                        {formatCurrency(calculateBudgetBreakdown().total)}
                                    </p>
                                </div>
                                <div className="border-l border-r border-gray-100">
                                    <p className="text-xs text-green-600 mb-1 font-medium">Paid</p>
                                    <p className="font-semibold text-green-700 text-sm md:text-base">
                                        {formatCurrency(calculateBudgetBreakdown().paid)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary-600 mb-1 font-medium">Remaining</p>
                                    <p className="font-bold text-primary-700 text-sm md:text-base">
                                        {formatCurrency(calculateBudgetBreakdown().remaining)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!isExpanded && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="absolute bottom-0 right-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
                    >
                        <div className="relative">
                            <Calculator className="w-6 h-6 md:w-7 md:h-7" />
                            {budget > 0 && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                                    <span className="text-xs font-bold">!</span>
                                </div>
                            )}
                        </div>
                    </button>
                )}
            </div>
        </>
    );
};
