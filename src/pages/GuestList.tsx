import React, { useState } from 'react';
import { useStore } from '../store';
import { GuestRow } from '../components/GuestRow';
import { GuestChart } from '../components/GuestChart';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Users, Plus, X, DollarSign, Heart, LogOut } from 'lucide-react';
import { SyncStatus } from '../components/SyncStatus';
import { useNavigate } from 'react-router-dom';
import { FloatingBudget } from '../components/FloatingBudget';

export const GuestList: React.FC = () => {
    const { guests, addGuest, currentPlan, logout } = useStore();
    const navigate = useNavigate();
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState('');
    const [occupancy, setOccupancy] = useState('1');
    const [tag, setTag] = useState('');

    if (!currentPlan) {
        navigate('/');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAddGuest = async () => {
        if (name.trim() && occupancy) {
            const guestTag = tag.trim() || 'General';
            await addGuest(name.trim(), parseInt(occupancy) || 1, guestTag);
            setName('');
            setOccupancy('1');
            setTag('');
            setShowAddForm(false);
        }
    };

    const totalGuests = guests.filter(g => g.selected).reduce((sum, g) => sum + g.occupancy, 0);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass sticky top-0 z-40 border-b border-white/20">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                            <Heart className="w-4 h-4 md:w-5 md:h-5 text-white" fill="white" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                                {currentPlan.name}
                            </h1>
                            <p className="text-xs md:text-sm text-gray-600">Wedding Planner</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => navigate('/dashboard')} size="sm">
                            <DollarSign className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Budget</span>
                        </Button>
                        <Button variant="ghost" onClick={handleLogout} size="sm" className="md:px-4 md:py-2">
                            <LogOut className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                            <span className="hidden md:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Guests</h2>
                        <SyncStatus />
                    </div>
                    <p className="text-sm md:text-base text-gray-600">
                        Manage your wedding guest list. Select guests to include in your total count.
                    </p>
                </div>

                {/* Total Guests Card */}
                <Card className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-primary-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Selected Guests</p>
                                <p className="text-3xl font-bold text-gray-800">{totalGuests}</p>
                            </div>
                        </div>
                        {guests.filter(g => g.selected).length > 0 && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500">{guests.filter(g => g.selected).length} guests selected</p>
                                <p className="text-xs text-gray-500">{guests.length} total</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Guest Distribution Chart */}
                {guests.filter(g => g.selected).length > 0 && (
                    <Card className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Guest Distribution</h2>
                        <GuestChart guests={guests} />
                    </Card>
                )}

                <div className="space-y-6">
                    {guests.map((guest) => (
                        <GuestRow key={guest.id} guest={guest} />
                    ))}

                    {showAddForm ? (
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Add New Guest</h3>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setName('');
                                        setOccupancy('1');
                                        setTag('');
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-3">
                                <Input
                                    placeholder="Guest name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <div className="flex gap-3">
                                    <Input
                                        type="number"
                                        placeholder="Number of people"
                                        value={occupancy}
                                        onChange={(e) => setOccupancy(e.target.value)}
                                        className="w-40"
                                        min="1"
                                    />
                                    <Input
                                        placeholder="Group/Tag (e.g., Family, Work Friends)"
                                        value={tag}
                                        onChange={(e) => setTag(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                                <Button onClick={handleAddGuest}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Guest
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <Button onClick={() => setShowAddForm(true)} className="w-full md:w-auto">
                            <Plus className="w-5 h-5 mr-2" />
                            Add Guest
                        </Button>
                    )}

                    {guests.length === 0 && !showAddForm && (
                        <Card className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No guests yet. Add your first guest!</p>
                        </Card>
                    )}
                </div>
            </div>

            <FloatingBudget />
        </div>
    );
};
