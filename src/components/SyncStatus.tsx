import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';

export const SyncStatus: React.FC = () => {
    const { lastSynced, currentPlan } = useStore();
    const [isSyncing, setIsSyncing] = useState(false);
    const [, setTick] = useState(0); // Force re-render

    // Update the display every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const handleManualSync = async () => {
        if (!currentPlan) return;

        setIsSyncing(true);
        try {
            // Trigger a state update to force sync
            useStore.setState({ currentPlan: { ...currentPlan } });
            // Wait a bit for the sync subscription to process
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setIsSyncing(false);
        }
    };

    const getLastSyncedText = () => {
        if (!lastSynced) return 'Not synced yet';

        const now = Date.now();
        const diff = now - lastSynced;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 10) return 'Just now';
        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return new Date(lastSynced).toLocaleDateString();
    };

    return (
        <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Last synced: {getLastSyncedText()}</span>
            <Button
                size="sm"
                variant="ghost"
                onClick={handleManualSync}
                disabled={isSyncing || !currentPlan}
                className="p-1 h-6"
            >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
        </div>
    );
};
