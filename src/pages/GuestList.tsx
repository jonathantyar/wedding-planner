import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { GuestRow } from '../components/GuestRow';
import { FloatingGuestSummary } from '../components/FloatingGuestSummary';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Users, Plus, X, DollarSign, Heart, LogOut, Search, Filter } from 'lucide-react';
import { SyncStatus } from '../components/SyncStatus';
import { useNavigate } from 'react-router-dom';

export const GuestList: React.FC = () => {
    const { guests, addGuest, currentPlan, logout } = useStore();
    const navigate = useNavigate();
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState('');
    const [occupancy, setOccupancy] = useState('1');
    const [tag, setTag] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTagFilter, setSelectedTagFilter] = useState('');

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

    // Get unique tags for filter dropdown
    const uniqueTags = useMemo(() => {
        const tags = new Set(guests.map(g => g.tag));
        return Array.from(tags).sort();
    }, [guests]);

    // Filter guests based on search and tag filter
    const filteredGuests = useMemo(() => {
        return guests.filter(guest => {
            const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = !selectedTagFilter || guest.tag === selectedTagFilter;
            return matchesSearch && matchesTag;
        });
    }, [guests, searchQuery, selectedTagFilter]);

    const totalGuests = guests.filter(g => g.selected).reduce((sum, g) => sum + g.occupancy, 0);
    const filteredTotal = filteredGuests.filter(g => g.selected).reduce((sum, g) => sum + g.occupancy, 0);
    const showFilteredStats = searchQuery || selectedTagFilter;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass sticky top-0 z-40 border-b border-white/20">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/${currentPlan.id}`)}>
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
                        <Button variant="secondary" onClick={() => navigate(`/${currentPlan.id}`)} size="sm">
                            <Heart className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Overview</span>
                        </Button>
                        <Button variant="secondary" onClick={() => navigate(`/${currentPlan.id}/budget`)} size="sm">
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

                {/* Search and Filter */}
                <Card className="mb-6">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Search Input */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search guests by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Tag Filter */}
                            <div className="md:w-64">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        value={selectedTagFilter}
                                        onChange={(e) => setSelectedTagFilter(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                    >
                                        <option value="">All Tags</option>
                                        {uniqueTags.map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {showFilteredStats && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedTagFilter('');
                                    }}
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Filtered Results Summary */}
                        {showFilteredStats && (
                            <div className="glass rounded-lg p-3 border border-primary-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary-600" />
                                        <span className="text-sm font-semibold text-gray-700">
                                            Filtered Results:
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {filteredGuests.length} guest{filteredGuests.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Selected in filter</p>
                                        <p className="text-lg font-bold text-primary-600">
                                            {filteredTotal} {filteredTotal === 1 ? 'person' : 'people'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="space-y-6">
                    {filteredGuests.length > 0 ? (
                        filteredGuests.map((guest) => (
                            <GuestRow key={guest.id} guest={guest} />
                        ))
                    ) : (
                        <Card>
                            <p className="text-center text-gray-500 py-4">
                                {searchQuery || selectedTagFilter
                                    ? 'No guests match your search criteria'
                                    : 'No guests yet. Add your first guest!'}
                            </p>
                        </Card>
                    )}

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

            <FloatingGuestSummary />
        </div>
    );
};
