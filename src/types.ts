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

export interface Store {
    plans: WeddingPlan[];
    currentPlan: WeddingPlan | null;
    lastSynced: number | null;

    // Plan actions
    createPlan: (name: string, passcode: string) => Promise<void>;
    login: (name: string, passcode: string) => Promise<boolean>;
    logout: () => void;

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

    // Budget calculation
    calculateBudget: () => number;
}
