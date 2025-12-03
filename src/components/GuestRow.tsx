import React, { useState } from 'react';
import type { Guest } from '../types';
import { useStore } from '../store';
import { Trash2, Check, X, Users } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

interface GuestRowProps {
    guest: Guest;
}

export const GuestRow: React.FC<GuestRowProps> = ({ guest }) => {
    const { updateGuest, deleteGuest } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(guest.name);
    const [occupancy, setOccupancy] = useState(guest.occupancy.toString());
    const [tag, setTag] = useState(guest.tag);

    const handleSave = async () => {
        if (name.trim() && tag.trim() && occupancy) {
            await updateGuest(guest.id, {
                name: name.trim(),
                occupancy: parseInt(occupancy) || 1,
                tag: tag.trim()
            });
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setName(guest.name);
        setOccupancy(guest.occupancy.toString());
        setTag(guest.tag);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (window.confirm(`Delete ${guest.name}?`)) {
            await deleteGuest(guest.id);
        }
    };

    const handleToggleSelection = () => {
        updateGuest(guest.id, { selected: !guest.selected });
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-3">
                <div className="w-10"></div>
                <Card className="flex-1">
                    <div className="flex flex-col gap-3">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Guest name"
                            className="text-sm"
                        />
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={occupancy}
                                onChange={(e) => setOccupancy(e.target.value)}
                                placeholder="People"
                                className="w-24 text-sm"
                                min="1"
                            />
                            <Input
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                placeholder="Group/Tag"
                                className="flex-1 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSave}>
                                <Check className="w-4 h-4 mr-1" />
                                Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancel}>
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div
                className="p-2 cursor-pointer"
                onClick={handleToggleSelection}
            >
                <input
                    type="checkbox"
                    checked={guest.selected}
                    onChange={() => { }}
                    className="w-5 h-5 md:w-6 md:h-6 rounded cursor-pointer"
                />
            </div>

            <Card
                className="flex-1 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setIsEditing(true)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h4 className="text-base md:text-xl font-bold text-gray-800">{guest.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                {guest.occupancy} {guest.occupancy === 1 ? 'person' : 'people'}
                            </span>
                            <span className="text-xs md:text-sm px-2 py-1 bg-accent-100 text-accent-700 rounded-full">
                                {guest.tag}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                        >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
