import React, { useState } from 'react';
import { Card } from './Card';
import type { Vendor } from '../types';
import { useStore } from '../store';
import { Trash2 } from 'lucide-react';
import { Button } from './Button';
import { formatCurrency } from '../lib/utils';
import { VendorModal } from './VendorModal';

interface VendorCardProps {
    vendor: Vendor;
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
    const { deleteVendor, toggleVendorSelection } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${vendor.name}" and all its data?`)) {
            deleteVendor(vendor.id);
        }
    };

    const { cost, paid } = vendor.useSum
        ? vendor.tags.reduce((acc, tag) => {
            if (!tag.selected) return acc;
            const tagStats = tag.useSum
                ? tag.items
                    .filter(item => item.selected)
                    .reduce((itemAcc, item) => {
                        const total = item.count * item.price;
                        if (total >= 0) {
                            return { ...itemAcc, cost: itemAcc.cost + total };
                        } else {
                            return { ...itemAcc, paid: itemAcc.paid + Math.abs(total) };
                        }
                    }, { cost: 0, paid: 0 })
                : { cost: tag.manualTotal, paid: 0 };
            return {
                cost: acc.cost + tagStats.cost,
                paid: acc.paid + tagStats.paid
            };
        }, { cost: 0, paid: 0 })
        : { cost: vendor.manualTotal, paid: 0 };

    return (
        <>
            <div className="flex items-center gap-3">
                <div
                    className="p-2 cursor-pointer"
                    onClick={() => toggleVendorSelection(vendor.id)}
                >
                    <input
                        type="checkbox"
                        checked={vendor.selected}
                        onChange={() => { }} // Handled by div onClick
                        className="w-5 h-5 md:w-6 md:h-6 rounded cursor-pointer"
                    />
                </div>

                <Card
                    className="flex-1 cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setIsModalOpen(true)}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-xl font-bold text-gray-800 truncate">{vendor.name}</h3>
                            <p className="text-xs md:text-sm text-gray-600">{vendor.tags.length} categories</p>
                        </div>

                        <div className="flex flex-col items-end flex-shrink-0">
                            <span className="text-sm md:text-lg font-bold text-primary-700">
                                {formatCurrency(cost)}
                            </span>
                            {paid > 0 && (
                                <span className="text-xs md:text-sm font-semibold text-green-600">
                                    Paid: {formatCurrency(paid)}
                                </span>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                        </Button>
                    </div>
                </Card>
            </div>

            <VendorModal
                vendor={vendor}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};
