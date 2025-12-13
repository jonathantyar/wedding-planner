import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Heart, DollarSign, Users, LogOut, Share2, Mail } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const Overview: React.FC = () => {
    const { currentPlan, logout, calculateBudget, guests } = useStore();
    const navigate = useNavigate();
    const [shareMessage, setShareMessage] = useState('');

    if (!currentPlan) return null;

    const budget = calculateBudget();
    const totalGuests = guests.filter(g => g.selected).reduce((sum, g) => sum + g.occupancy, 0);

    // Update meta tags for SEO
    useEffect(() => {
        const planTitle = `${currentPlan.name} - Wedding Overview`;
        const planDescription = `Wedding plan for ${currentPlan.name}. Budget: ${formatCurrency(budget)}, Guests: ${totalGuests}. Manage your dream wedding with our free planner.`;

        // Update title
        document.title = planTitle;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', planDescription);
        }

        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', planTitle);
        }

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.setAttribute('content', planDescription);
        }

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) {
            ogUrl.setAttribute('content', `${window.location.origin}/${currentPlan.id}`);
        }

        // Update Twitter Card tags
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) {
            twitterTitle.setAttribute('content', planTitle);
        }

        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescription) {
            twitterDescription.setAttribute('content', planDescription);
        }

        const twitterUrl = document.querySelector('meta[name="twitter:url"]');
        if (twitterUrl) {
            twitterUrl.setAttribute('content', `${window.location.origin}/${currentPlan.id}`);
        }

        // Cleanup: restore original tags when component unmounts
        return () => {
            document.title = 'Wedding Planner - Plan Your Perfect Day | Budget & Guest Management';
        };
    }, [currentPlan.name, currentPlan.id, budget, totalGuests]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/${currentPlan.id}`;
        const shareData = {
            title: `${currentPlan.name} - Wedding Plan`,
            text: `Check out our wedding plan! 💍`,
            url: shareUrl
        };

        try {
            // Try to use native share API (mobile devices)
            if (navigator.share) {
                await navigator.share(shareData);
                setShareMessage('Shared successfully!');
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(shareUrl);
                setShareMessage('Link copied to clipboard!');
            }

            // Clear message after 3 seconds
            setTimeout(() => setShareMessage(''), 3000);
        } catch (err) {
            // User cancelled or error occurred
            if ((err as Error).name !== 'AbortError') {
                console.error('Error sharing:', err);
            }
        }
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
                        <Button variant="secondary" onClick={handleShare} size="sm">
                            <Share2 className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Share</span>
                        </Button>
                        <Button variant="ghost" onClick={handleLogout} size="sm" className="md:px-4 md:py-2">
                            <LogOut className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                            <span className="hidden md:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Share Success Message */}
            {shareMessage && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top">
                    <div className="glass px-6 py-3 rounded-lg shadow-xl border-2 border-green-200">
                        <p className="text-green-700 font-semibold flex items-center gap-2">
                            <Share2 className="w-4 h-4" />
                            {shareMessage}
                        </p>
                    </div>
                </div>
            )}

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

                    {/* Invitations Card */}
                    <Card
                        className="p-8 cursor-pointer hover:shadow-xl transition-all group md:col-span-2 lg:col-span-1"
                        onClick={() => navigate(`/${currentPlan.id}/invitations`)}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6 text-purple-600" />
                            </div>
                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                Browse Themes →
                            </Button>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitations</h2>
                        <p className="text-gray-600 mb-4">Choose and customize your wedding invitation.</p>
                        <div className="text-3xl font-bold text-purple-600">
                            6 Themes
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Available designs</p>
                    </Card>
                </div>
            </div>
        </div >
    );
};
