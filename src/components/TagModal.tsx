import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { CurrencyInput } from './CurrencyInput';
import type { Vendor, Tag, Item } from '../types';
import { useStore } from '../store';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface EditableItemProps {
    item: Item;
    vendorId: string;
    tagId: string;
    editingItemId: string | null;
    setEditingItemId: (id: string | null) => void;
}

const EditableItem: React.FC<EditableItemProps> = ({
    item,
    vendorId,
    tagId,
    editingItemId,
    setEditingItemId
}) => {
    const { updateItem, deleteItem, toggleItemSelection } = useStore();
    const [name, setName] = useState(item.name);
    const [count, setCount] = useState(item.count.toString());
    const [price, setPrice] = useState(item.price.toString());
    const isEditing = editingItemId === item.id;

    const handleSave = () => {
        updateItem(vendorId, tagId, item.id, {
            name,
            count: parseFloat(count) || 1,
            price: parseFloat(price) || 0
        });
        setEditingItemId(null);
    };

    const handleCancel = () => {
        setName(item.name);
        setCount(item.count.toString());
        setPrice(item.price.toString());
        setEditingItemId(null);
    };

    const handleDelete = () => {
        if (window.confirm('Delete this item?')) {
            deleteItem(vendorId, tagId, item.id);
        }
    };

    if (isEditing) {
        return (
            <div className="glass rounded-lg p-3">
                <div className="flex flex-col gap-2">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Item name"
                        className="text-sm"
                    />
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Qty"
                            className="w-20 text-sm"
                        />
                        <CurrencyInput
                            value={price}
                            onChange={(value) => setPrice(value)}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            placeholder="Price"
                            className="flex-1 text-sm"
                        />
                        <Button size="sm" onClick={handleSave}>
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancel}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div
                className="p-2 cursor-pointer"
                onClick={() => toggleItemSelection(vendorId, tagId, item.id)}
            >
                <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => { }}
                    className="w-5 h-5 rounded cursor-pointer"
                />
            </div>
            <div className="glass rounded-lg p-3 hover:shadow-md transition-shadow flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-600">
                            {item.count} × {formatCurrency(item.price)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary-700 text-sm">
                            {formatCurrency(item.count * item.price)}
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingItemId(item.id)}
                        >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TagModalProps {
    vendor: Vendor;
    tag: Tag;
    isOpen: boolean;
    onClose: () => void;
}

export const TagModal: React.FC<TagModalProps> = ({ vendor, tag, isOpen, onClose }) => {
    const { addItem } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [tagName, setTagName] = useState(tag.name);
    const [showAddItem, setShowAddItem] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemCount, setItemCount] = useState('1');
    const [itemPrice, setItemPrice] = useState('0');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    const handleSave = () => {
        if (tagName.trim()) {
            const updatedTags = vendor.tags.map(t =>
                t.id === tag.id ? { ...t, name: tagName } : t
            );
            useStore.getState().updateVendor(vendor.id, { tags: updatedTags });
            setIsEditing(false);
        }
    };

    const handleAddItem = () => {
        if (itemName.trim() && itemPrice) {
            addItem(vendor.id, tag.id, itemName, parseFloat(itemCount) || 1, parseFloat(itemPrice) || 0);
            setItemName('');
            setItemCount('1');
            setItemPrice('0');
            setShowAddItem(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={tag.name}>
            {/* Add Item */}
            <div className="mt-4">
                {showAddItem ? (
                    <div className="glass rounded-lg p-3">
                        <div className="flex flex-col gap-2">
                            <Input
                                placeholder="Item Name"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                className="w-full text-sm"
                                autoFocus
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
                                <Button size="sm" variant="ghost" onClick={() => setShowAddItem(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                                <Button size="sm" onClick={handleAddItem} disabled={!itemName.trim() || !itemPrice}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
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

            {/* Tag Name Edit */}
            <div className="mb-6">
                {isEditing ? (
                    <div className="flex gap-2">
                        <Input
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            className="flex-1"
                            autoFocus
                        />
                        <Button size="sm" onClick={handleSave}>
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-700">Items</h3>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                            Edit Name
                        </Button>
                    </div>
                )}
            </div>

            {/* Items List */}
            <div className="space-y-2">
                {tag.items.map((item) => (
                    <EditableItem
                        key={item.id}
                        item={item}
                        vendorId={vendor.id}
                        tagId={tag.id}
                        editingItemId={editingItemId}
                        setEditingItemId={setEditingItemId}
                    />
                ))}
            </div>

        </Modal>
    );
};
