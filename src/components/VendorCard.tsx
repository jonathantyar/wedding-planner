import React, { useState } from 'react';
import { useStore } from '../store';
import type { Vendor } from '../types';
import { TagSection } from './TagSection';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface VendorCardProps {
    vendor: Vendor;
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [vendorName, setVendorName] = useState(vendor.name);
    const [showAddTag, setShowAddTag] = useState(false);
    const [tagName, setTagName] = useState('');

    const { updateVendor, deleteVendor, addTag, toggleVendorSelection } = useStore();

    const handleSaveVendor = () => {
        updateVendor(vendor.id, { name: vendorName });
        setIsEditing(false);
    };

    const handleAddTag = () => {
        if (tagName.trim()) {
            addTag(vendor.id, tagName);
            setTagName('');
            setShowAddTag(false);
        }
    };

    const vendorTotal = vendor.useSum
        ? vendor.tags.reduce((sum, tag) => {
            const tagTotal = tag.useSum
                ? tag.items.reduce((s, item) => s + item.count * item.price, 0)
                : tag.manualTotal;
            return sum + tagTotal;
        }, 0)
        : vendor.manualTotal;

    return (
        <Card className="space-y-1">
            <div className="flex items-center gap-2 md:gap-4 mb-2">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
                >
                    {isExpanded ? <ChevronUp className="w-5 h-5 md:w-6 md:h-6" /> : <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
                <input
                    type="checkbox"
                    checked={vendor.selected}
                    onChange={() => toggleVendorSelection(vendor.id)}
                    className="w-5 h-5 md:w-6 md:h-6 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                />
                {isEditing ? (
                    <>
                        <Input
                            type="text"
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            className="flex-1 py-2 text-sm md:text-base"
                        />
                        <Button size="sm" variant="primary" onClick={handleSaveVendor}>
                            <Check className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                    </>
                ) : (
                    <>
                        <h3 className="text-base md:text-xl font-bold text-gray-800 flex-1">{vendor.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm md:text-lg font-bold text-primary-700 whitespace-nowrap">
                                {formatCurrency(vendorTotal)}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="p-1 h-8 w-8">
                                    <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteVendor(vendor.id)}
                                    className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
                                >
                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {isExpanded && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={vendor.useSum}
                                onChange={() => updateVendor(vendor.id, { useSum: true })}
                                className="text-primary-600 focus:ring-primary-500"
                            />
                            <span>Use Sum</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={!vendor.useSum}
                                onChange={() => updateVendor(vendor.id, { useSum: false })}
                                className="text-primary-600 focus:ring-primary-500"
                            />
                            <span>Manual Total</span>
                        </label>
                        {!vendor.useSum && (
                            <Input
                                type="number"
                                value={vendor.manualTotal}
                                onChange={(e) =>
                                    updateVendor(vendor.id, {
                                        manualTotal: parseFloat(e.target.value) || 0,
                                    })
                                }
                                className="w-32 md:w-40 py-1 text-xs md:text-sm"
                                placeholder="Amount"
                            />
                        )}
                    </div>

                    <div className="space-y-4">
                        {vendor.tags.map((tag) => (
                            <TagSection key={tag.id} vendorId={vendor.id} tag={tag} />
                        ))}
                    </div>

                    {showAddTag ? (
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                value={tagName}
                                onChange={(e) => setTagName(e.target.value)}
                                placeholder="Tag name (e.g., Food, Decorations)"
                                className="flex-1 py-2"
                            />
                            <Button size="sm" variant="primary" onClick={handleAddTag}>
                                <Check className="w-5 h-5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowAddTag(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowAddTag(true)}
                            className="w-full flex items-center justify-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            <span>Add Category</span>
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
};
