import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Heart, DollarSign, Users, LogOut } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const Overview: React.FC = () => {
    const { currentPlan, logout, calculateBudget, guests } = useStore();
    const navigate = useNavigate();

    if (!currentPlan) return null;

    const budget = calculateBudget();
    const totalGuests = guests.filter(g => g.selected).reduce((sum, g) => sum + g.occupancy, 0);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
                        <Button variant="ghost" onClick={handleLogout} size="sm" className="md:px-4 md:py-2">
                            <LogOut className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                            <span className="hidden md:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Budget Card */}
                    <Card
                        className="p-8 cursor-pointer hover:shadow-xl transition-all group"
                        onClick={() => navigate(`/${currentPlan.id}/budget`)}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                Open Budget →
                            </Button>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Budget Plan</h2>
                        <p className="text-gray-600 mb-4">Manage vendors, costs, and payments.</p>
                        <div className="text-3xl font-bold text-primary-600">
                            {formatCurrency(budget)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Total estimated cost</p>
                    </Card>

                    {/* Guest List Card */}
                    <Card
                        className="p-8 cursor-pointer hover:shadow-xl transition-all group"
                        onClick={() => navigate(`/${currentPlan.id}/guests`)}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                Open Guest List →
                            </Button>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Guest List</h2>
                        <p className="text-gray-600 mb-4">Track guests, RSVPs, and groups.</p>
                        <div className="text-3xl font-bold text-accent-600">
                            {totalGuests}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Total guests</p>
                    </Card>
                </div>
            </div>
        </div>
    );
};
