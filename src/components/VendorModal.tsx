import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import type { Vendor } from '../types';
import { useStore } from '../store';
import { Plus, Trash2, Check, X as XIcon } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { TagModal } from './TagModal';

interface VendorModalProps {
    vendor: Vendor;
    isOpen: boolean;
    onClose: () => void;
}

export const VendorModal: React.FC<VendorModalProps> = ({ vendor, isOpen, onClose }) => {
    const { updateVendor, addTag, deleteTag } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [vendorName, setVendorName] = useState(vendor.name);
    const [showAddTag, setShowAddTag] = useState(false);
    const [tagName, setTagName] = useState('');
    const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

    const handleSave = () => {
        if (vendorName.trim()) {
            updateVendor(vendor.id, { name: vendorName });
            setIsEditing(false);
        }
    };

    const handleAddTag = () => {
        if (tagName.trim()) {
            addTag(vendor.id, tagName);
            setTagName('');
            setShowAddTag(false);
        }
    };

    const handleDeleteTag = (tagId: string) => {
        if (window.confirm('Delete this category and all its items?')) {
            deleteTag(vendor.id, tagId);
        }
    };

    const selectedTag = vendor.tags.find(t => t.id === selectedTagId);

    return (
        <>
            <Modal isOpen={isOpen && !selectedTagId} onClose={onClose} title={vendor.name}>
                {/* Vendor Name Edit */}
                <div className="mb-6">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Input
                                value={vendorName}
                                onChange={(e) => setVendorName(e.target.value)}
                                className="flex-1"
                                autoFocus
                            />
                            <Button size="sm" onClick={handleSave}>
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                <XIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-700">Categories</h3>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                                Edit Name
                            </Button>
                        </div>
                    )}
                </div>


                {/* Add Tag */}
                <div className="mt-4">
                    {showAddTag ? (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Category name (e.g., Food, Decoration)"
                                value={tagName}
                                onChange={(e) => setTagName(e.target.value)}
                                className="flex-1"
                                autoFocus
                            />
                            <Button size="sm" onClick={handleAddTag}>
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowAddTag(false)}>
                                <XIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowAddTag(true)}
                            className="w-full flex items-center justify-center mt-3"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            <span>Add Category</span>
                        </Button>
                    )}
                </div>

                {/* Tags List */}
                <div className="space-y-3">
                    {vendor.tags.map((tag) => {
                        const tagTotal = tag.useSum
                            ? tag.items
                                .filter(item => item.selected)
                                .reduce((sum, item) => sum + item.count * item.price, 0)
                            : tag.manualTotal;

                        return (
                            <div key={tag.id} className="flex items-center gap-3">
                                <div
                                    className="p-2 cursor-pointer"
                                    onClick={() => useStore.getState().toggleTagSelection(vendor.id, tag.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={tag.selected}
                                        onChange={() => { }}
                                        className="w-5 h-5 rounded cursor-pointer"
                                    />
                                </div>
                                <div
                                    className="glass rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer flex-1"
                                    onClick={() => setSelectedTagId(tag.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{tag.name}</h4>
                                            <p className="text-sm text-gray-600">{tag.items.length} items</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-accent-600">
                                                {formatCurrency(tagTotal)}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTag(tag.id);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Modal>

            {/* Tag Modal */}
            {selectedTag && (
                <TagModal
                    vendor={vendor}
                    tag={selectedTag}
                    isOpen={!!selectedTagId}
                    onClose={() => setSelectedTagId(null)}
                />
            )}
        </>
    );
};
