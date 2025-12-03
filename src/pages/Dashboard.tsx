import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { VendorCard } from '../components/VendorCard';
import { FloatingBudget } from '../components/FloatingBudget';
import { SyncStatus } from '../components/SyncStatus';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Heart, LogOut, Plus, Check, X, Users, Search } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const Dashboard: React.FC = () => {
    const { currentPlan, logout, addVendor, toggleItemSelection } = useStore();
    const navigate = useNavigate();
    const [showAddVendor, setShowAddVendor] = useState(false);
    const [vendorName, setVendorName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    if (!currentPlan) {
        navigate('/');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAddVendor = () => {
        if (vendorName.trim()) {
            addVendor(vendorName);
            setVendorName('');
            setShowAddVendor(false);
        }
    };

    // Flatten all items across vendors with vendor/tag context
    const allItems = useMemo(() => {
        const items: Array<{
            vendorId: string;
            vendorName: string;
            tagId: string;
            tagName: string;
            item: any;
        }> = [];

        currentPlan.vendors.forEach(vendor => {
            vendor.tags.forEach(tag => {
                tag.items.forEach(item => {
                    items.push({
                        vendorId: vendor.id,
                        vendorName: vendor.name,
                        tagId: tag.id,
                        tagName: tag.name,
                        item
                    });
                });
            });
        });

        return items;
    }, [currentPlan.vendors]);

    // Filter items based on search
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return [];

        return allItems.filter(({ vendorName, tagName, item }) => {
            const query = searchQuery.toLowerCase();
            return (
                vendorName.toLowerCase().includes(query) ||
                tagName.toLowerCase().includes(query) ||
                item.name.toLowerCase().includes(query)
            );
        });
    }, [allItems, searchQuery]);

    const showComparison = searchQuery.trim().length > 0;

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
                        <Button variant="secondary" onClick={() => navigate(`/${currentPlan.id}/guests`)} size="sm">
                            <Users className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Guests</span>
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
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Vendors</h2>
                        <SyncStatus />
                    </div>
                    <p className="text-sm md:text-base text-gray-600">
                        Manage your wedding vendors, tags, and items. Select items to include in your budget.
                    </p>
                </div>

                {/* Search for Comparison */}
                <Card className="mb-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search items across all vendors (e.g., 'photographer', 'flowers')..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            {showComparison && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Comparison Results */}
                        {showComparison && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-semibold text-gray-800">
                                        Comparison Results ({filteredItems.length} items)
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Click checkboxes to include/exclude from budget
                                    </p>
                                </div>

                                {filteredItems.length > 0 ? (
                                    <div className="grid gap-3">
                                        {filteredItems.map(({ vendorId, vendorName, tagId, tagName, item }) => (
                                            <div
                                                key={`${vendorId}-${tagId}-${item.id}`}
                                                className="glass rounded-lg p-4 border border-gray-200 hover:border-primary-300 transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.selected}
                                                            onChange={() => toggleItemSelection(vendorId, tagId, item.id)}
                                                            className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold text-gray-800">
                                                                    {item.name}
                                                                </span>
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                                                                    {vendorName}
                                                                </span>
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                                    {tagName}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <span>Qty: {item.count}</span>
                                                                <span>×</span>
                                                                <span>{formatCurrency(item.price)}</span>
                                                                <span>=</span>
                                                                <span className="font-semibold text-primary-600">
                                                                    {formatCurrency(item.count * item.price)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">
                                        No items match your search
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                <div className="space-y-6">
                    {currentPlan.vendors.map((vendor) => (
                        <VendorCard key={vendor.id} vendor={vendor} />
                    ))}

                    {showAddVendor ? (
                        <div className="glass rounded-2xl p-4 flex items-center gap-3">
                            <Input
                                type="text"
                                value={vendorName}
                                onChange={(e) => setVendorName(e.target.value)}
                                placeholder="Vendor name (e.g., Catering, Photography)"
                                className="flex-1"
                                autoFocus
                            />
                            <Button variant="primary" onClick={handleAddVendor}>
                                <Check className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" onClick={() => setShowAddVendor(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAddVendor(true)}
                            className="w-full glass rounded-2xl p-4 border-2 border-dashed border-gray-300 hover:border-primary-400 transition-all duration-300 hover:shadow-xl group"
                        >
                            <div className="flex items-center justify-center gap-3 text-gray-600 group-hover:text-primary-600 transition-colors">
                                <Plus className="w-6 h-6" />
                                <span className="font-semibold text-lg">Add Vendor</span>
                            </div>
                        </button>
                    )}
                </div>

                {currentPlan.vendors.length === 0 && !showAddVendor && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 mb-4">
                            <Heart className="w-12 h-12 text-primary-500" />
                        </div>
                        <h3 className="md:text-2xl text-1xl font-bold text-gray-800 mb-2">
                            Start Planning Your Wedding
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Add your first vendor to begin organizing your budget
                        </p>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowAddVendor(true)}
                            className="w-full flex items-center justify-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            <span>Add Your First Vendor</span>
                        </Button>
                    </div>
                )}
            </div>

            <FloatingBudget />
        </div>
    );
};
