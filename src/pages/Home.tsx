import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Heart, Lock, User } from 'lucide-react';

export const Home: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');

    const { createPlan, login } = useStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !passcode.trim()) {
            setError('Please fill in all fields');
            return;
        }

        if (isLogin) {
            const success = await login(name, passcode);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Invalid plan name or passcode');
            }
        } else {
            await createPlan(name, passcode);
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 mb-4 shadow-2xl">
                        <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" fill="white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
                        Wedding Planner
                    </h1>
                    <p className="text-sm md:text-base text-gray-600">Plan your perfect day, manage your budget</p>
                </div>

                <Card>
                    <div className="flex gap-2 mb-6">
                        <Button
                            variant={isLogin ? 'primary' : 'secondary'}
                            className="flex-1"
                            onClick={() => {
                                setIsLogin(true);
                                setError('');
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            variant={!isLogin ? 'primary' : 'secondary'}
                            className="flex-1"
                            onClick={() => {
                                setIsLogin(false);
                                setError('');
                            }}
                        >
                            Create Plan
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Plan Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="password"
                                placeholder="Passcode"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg md:text-sm text-xs">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full">
                            {isLogin ? 'Access Plan' : 'Create Plan'}
                        </Button>
                    </form>

                    {!isLogin && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="md:text-sm text-xs text-blue-800">
                                <strong>Note:</strong> Your plan will be stored locally in your browser.
                                Remember your passcode to access it later!
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
