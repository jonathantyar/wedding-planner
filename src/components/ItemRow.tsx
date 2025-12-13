import React, { useState } from 'react';
import { useStore } from '../store';
import type { Item } from '../types';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { CurrencyInput } from './CurrencyInput';
import { formatCurrency } from '../lib/utils';

interface ItemRowProps {
    vendorId: string;
    tagId: string;
    item: Item;
}

export const ItemRow: React.FC<ItemRowProps> = ({ vendorId, tagId, item }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(item.name);
    const [count, setCount] = useState(item.count.toString());
    const [price, setPrice] = useState(item.price.toString());

    const { updateItem, deleteItem, toggleItemSelection } = useStore();

    const handleSave = () => {
        updateItem(vendorId, tagId, item.id, {
            name,
            count: parseFloat(count) || 0,
            price: parseFloat(price) || 0,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(item.name);
        setCount(item.count.toString());
        setPrice(item.price.toString());
        setIsEditing(false);
    };

    const total = item.count * item.price;

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
                {/* <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItemSelection(vendorId, tagId, item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                /> */}
                <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-2"
                    placeholder="Item name"
                />
                <Input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-24 py-2"
                    placeholder="Count"
                />
                <CurrencyInput
                    value={price}
                    onChange={(value) => setPrice(value)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    placeholder="Price"
                    className="w-24 text-sm"
                />
                <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); handleSave(); }}>
                    <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleCancel(); }}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 p-1 md:p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors group">
            <input
                type="checkbox"
                checked={item.selected}
                onChange={() => toggleItemSelection(vendorId, tagId, item.id)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
            />
            <div className="flex-1 min-w-0 flex flex-col">
                <p className="font-medium text-gray-800 text-sm md:text-base truncate">{item.name}</p>
                <div className="text-xs text-gray-600">
                    {item.count} × {formatCurrency(item.price)}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="font-semibold text-primary-700 text-xs md:text-sm whitespace-nowrap">
                    {formatCurrency(total)}
                </div>
                <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1 h-8 w-8">
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteItem(vendorId, tagId, item.id)}
                        className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
