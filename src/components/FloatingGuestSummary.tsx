import React from 'react';
import { useStore } from '../store';
import { GuestChart } from './GuestChart';
import { Users } from 'lucide-react';

export const FloatingGuestSummary: React.FC = () => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const { guests } = useStore();

    const selectedGuests = guests.filter(g => g.selected);
    const totalGuests = selectedGuests.reduce((sum, g) => sum + g.occupancy, 0);

    if (guests.length === 0) return null;

    return (
        <>
            {isExpanded && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsExpanded(false)} />
            )}
            <div className={`fixed z-50 transition-all duration-300 ${isExpanded ? 'bottom-0 left-0 right-0 md:bottom-8 md:left-auto md:right-8' : 'bottom-8 right-8'}`}>
                {isExpanded && (
                    <div className="glass md:rounded-2xl rounded-t-2xl p-6 shadow-2xl md:min-w-[350px] md:w-auto w-full animate-in slide-in-from-bottom max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-800">Guest Summary</h3>
                            <button onClick={() => setIsExpanded(false)} className="md:hidden p-2 text-gray-500">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Total Selected</span>
                                <span className="text-2xl font-bold text-primary-600">{totalGuests}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{selectedGuests.length} guests selected</span>
                                <span>{guests.length} total</span>
                            </div>
                        </div>

                        {selectedGuests.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribution by Group</h4>
                                <GuestChart guests={guests} />
                            </div>
                        )}

                        <div className="border-t-2 border-gray-200 pt-3 mt-4">
                            <div className="flex justify-between font-bold text-lg">
                                <span className="text-gray-800">Total Guests</span>
                                <span className="text-primary-600">{totalGuests}</span>
                            </div>
                        </div>
                    </div>
                )}

                {!isExpanded && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="absolute bottom-0 right-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
                    >
                        <div className="relative">
                            <Users className="w-6 h-6 md:w-7 md:h-7" />
                            {totalGuests > 0 && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                                    <span className="text-xs font-bold">{totalGuests}</span>
                                </div>
                            )}
                        </div>
                    </button>
                )}
            </div>
        </>
    );
};
