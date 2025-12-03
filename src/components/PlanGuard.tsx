import React, { useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useStore } from '../store';
import { Input } from './Input';
import { Button } from './Button';
import { Card } from './Card';
import { Heart } from 'lucide-react';

export const PlanGuard: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const { currentPlan, loadPlanById } = useStore();
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If we have a current plan and it matches the URL, render the content
    if (currentPlan && currentPlan.id === planId) {
        return <Outlet />;
    }

    // Otherwise, show the passcode entry screen
    const handleAccess = async () => {
        if (!planId || !passcode.trim()) return;

        setLoading(true);
        setError('');

        const success = await loadPlanById(planId, passcode.trim());

        if (!success) {
            setError('Invalid passcode or plan not found');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 p-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Heart className="w-8 h-8 text-white" fill="white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Access Wedding Plan</h1>
                    <p className="text-gray-600 mt-2">Please enter the passcode to access this plan.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <Input
                            type="password"
                            placeholder="Enter passcode"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            className="text-center text-lg tracking-widest"
                        />
                        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                    </div>

                    <Button
                        onClick={handleAccess}
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Access Plan'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
