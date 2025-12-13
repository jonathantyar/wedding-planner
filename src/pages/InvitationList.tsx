import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, DollarSign, LogOut } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useStore } from '../store';

const THEMES = [
    { id: 1, name: 'Floral Elegance', category: 'Classic', image: 'https://images.unsplash.com/photo-1519225421980-715cb0202128?w=800&q=80', status: 'Ready' },
    { id: 2, name: 'Modern Minimalist', category: 'Modern', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80', status: 'In Progress' },
    { id: 3, name: 'Rustic Charm', category: 'Rustic', image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&q=80', status: 'New' },
    { id: 4, name: 'Beach Vibes', category: 'Destination', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80', status: 'Ready' },
    { id: 5, name: 'Vintage Glamour', category: 'Vintage', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', status: 'Coming Soon' },
    { id: 6, name: 'Royal Gold', category: 'Luxury', image: 'https://images.unsplash.com/photo-1478146896981-b80c4635435c?w=800&q=80', status: 'Ready' },
];

export const InvitationList: React.FC = () => {
    const navigate = useNavigate();
    const { currentPlan, logout } = useStore();

    if (!currentPlan) {
        navigate('/');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 pb-12">
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

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Invitation Themes</h2>
                    <p className="text-sm md:text-base text-gray-600">
                        Choose from our collection of beautiful wedding invitation themes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {THEMES.map((theme) => (
                        <Card key={theme.id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="relative h-56 overflow-hidden bg-gray-100">
                                <img
                                    src={theme.image}
                                    alt={theme.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-sm">
                                    {theme.category}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-800">{theme.name}</h3>
                                    {theme.status === 'New' && (
                                        <span className="flex items-center text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full border border-primary-100">
                                            <Sparkles className="w-3 h-3 mr-1" /> New
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-5">Create a stunning first impression with this {theme.category.toLowerCase()} design.</p>
                                <Button className="w-full justify-center shadow-md group-hover:shadow-lg transition-all" variant={theme.status === 'Coming Soon' ? 'secondary' : 'primary'} disabled={theme.status === 'Coming Soon'}>
                                    {theme.status === 'Coming Soon' ? 'Coming Soon' : 'Choose Theme'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};