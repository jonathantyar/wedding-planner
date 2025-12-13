export interface Item {
    id: string;
    name: string;
    count: number;
    price: number;
    selected: boolean;
}

export interface Tag {
    id: string;
    name: string;
    items: Item[];
    useSum: boolean;
    manualTotal: number;
    selected: boolean;
}

export interface Vendor {
    id: string;
    name: string;
    tags: Tag[];
    useSum: boolean;
    manualTotal: number;
    selected: boolean;
}

export interface WeddingPlan {
    id: string;
    name: string;
    passcode: string;
    vendors: Vendor[];
    createdAt: number;
}

export interface Guest {
    id: string;
    name: string;
    occupancy: number; // Number of people this guest brings
    tag: string; // Group/category like "Family", "Work Friends", etc.
    selected: boolean; // Whether to include in count
}

export interface Store {
    currentPlan: WeddingPlan | null;
    lastSynced: number | null;
    guests: Guest[];
    isLoading: boolean;

    // Plan actions
    createPlan: (name: string, passcode: string) => Promise<void>;
    login: (name: string, passcode: string) => Promise<boolean>;
    logout: () => void;
    loadPlanById: (planId: string, passcode: string) => Promise<boolean>;
    refreshPlan: () => Promise<void>;

    // Polling actions
    startPolling: () => void;
    stopPolling: () => void;

    // Vendor actions
    addVendor: (name: string) => void;
    updateVendor: (vendorId: string, updates: Partial<Vendor>) => void;
    deleteVendor: (vendorId: string) => void;
    toggleVendorSelection: (vendorId: string) => void;

    // Tag actions
    addTag: (vendorId: string, name: string) => void;
    updateTag: (vendorId: string, tagId: string, updates: Partial<Tag>) => void;
    deleteTag: (vendorId: string, tagId: string) => void;
    toggleTagSelection: (vendorId: string, tagId: string) => void;

    // Item actions
    addItem: (vendorId: string, tagId: string, name: string, count: number, price: number) => void;
    updateItem: (vendorId: string, tagId: string, itemId: string, updates: Partial<Item>) => void;
    deleteItem: (vendorId: string, tagId: string, itemId: string) => void;
    toggleItemSelection: (vendorId: string, tagId: string, itemId: string) => void;

    // Guest actions
    addGuest: (name: string, occupancy: number, tag: string) => Promise<void>;
    updateGuest: (guestId: string, updates: Partial<Guest>) => Promise<void>;
    deleteGuest: (guestId: string) => Promise<void>;
    loadGuests: (planId: string) => Promise<void>;

    // Budget calculation
    calculateBudget: () => number;
    calculateBudgetBreakdown: () => { total: number; paid: number; remaining: number };
}
