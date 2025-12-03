import React, { useState } from 'react';
import { useStore } from '../store';
import type { Tag } from '../types';
import { ItemRow } from './ItemRow';
import { Button } from './Button';
import { Input } from './Input';
import { CurrencyInput } from './CurrencyInput';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface TagSectionProps {
    vendorId: string;
    tag: Tag;
}

export const TagSection: React.FC<TagSectionProps> = ({ vendorId, tag }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tagName, setTagName] = useState(tag.name);
    const [showAddItem, setShowAddItem] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemCount, setItemCount] = useState('1');
    const [itemPrice, setItemPrice] = useState('0');

    const { updateTag, deleteTag, addItem, toggleTagSelection } = useStore();

    const handleSaveTag = () => {
        updateTag(vendorId, tag.id, { name: tagName });
        setIsEditing(false);
    };

    const handleAddItem = () => {
        if (itemName.trim()) {
            addItem(
                vendorId,
                tag.id,
                itemName,
                parseFloat(itemCount) || 1,
                parseFloat(itemPrice) || 0
            );
            setItemName('');
            setItemCount('1');
            setItemPrice('0');
            setShowAddItem(false);
        }
    };

    const tagTotal = tag.useSum
        ? tag.items
            .filter(item => item.selected)
            .reduce((sum, item) => sum + item.count * item.price, 0)
        : tag.manualTotal;

    return (
        <div className="bg-white/50 rounded-lg p-2 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 md:gap-3 mb-3">
                <input
                    type="checkbox"
                    checked={tag.selected}
                    onChange={() => toggleTagSelection(vendorId, tag.id)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                />
                {isEditing ? (
                    <>
                        <Input
                            type="text"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            className="flex-1 py-2 text-sm"
                        />
                        <Button size="sm" variant="primary" onClick={handleSaveTag}>
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">{tag.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm md:text-base font-medium text-accent-600 whitespace-nowrap">
                                {formatCurrency(tagTotal)}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="p-1 h-8 w-8">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteTag(vendorId, tag.id)}
                                    className="text-red-600 p-1 h-8 w-8"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        checked={tag.useSum}
                        onChange={() => updateTag(vendorId, tag.id, { useSum: true })}
                        className="text-primary-600 focus:ring-primary-500"
                    />
                    <span>Use Sum</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        checked={!tag.useSum}
                        onChange={() => updateTag(vendorId, tag.id, { useSum: false })}
                        className="text-primary-600 focus:ring-primary-500"
                    />
                    <span>Manual Total</span>
                </label>
                {!tag.useSum && (
                    <Input
                        type="number"
                        value={tag.manualTotal}
                        onChange={(e) =>
                            updateTag(vendorId, tag.id, {
                                manualTotal: parseFloat(e.target.value) || 0,
                            })
                        }
                        className="w-24 md:w-32 py-1 text-xs"
                        placeholder="Amount"
                    />
                )}
            </div>

            <div className="space-y-2 mt-3">
                {tag.items.map((item) => (
                    <ItemRow key={item.id} vendorId={vendorId} tagId={tag.id} item={item} />
                ))}
            </div>

            {showAddItem ? (
                <div className="flex flex-col gap-2 mt-4 p-3 bg-white/30 rounded-lg">
                    <Input
                        placeholder="Item Name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full text-sm"
                    />
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Qty"
                            value={itemCount}
                            onChange={(e) => setItemCount(e.target.value)}
                            className="w-20 flex-shrink-0 text-sm"
                        />
                        <CurrencyInput
                            placeholder="Price"
                            value={itemPrice}
                            onChange={(value) => setItemPrice(value)}
                            className="flex-1 text-sm"
                        />
                        <Button size="sm" variant="ghost" onClick={() => setShowAddItem(false)} className="flex-shrink-0">
                            <X className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={handleAddItem} disabled={!itemName.trim() || !itemPrice} className="flex-shrink-0">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowAddItem(true)}
                    className="w-full flex items-center justify-center mt-3"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    <span>Add Item</span>
                </Button>
            )}
        </div>
    );
};
