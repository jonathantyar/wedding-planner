import { create } from 'zustand';
import type { Store, WeddingPlan, Vendor, Tag, Item, Guest } from './types';

import { supabase } from './lib/supabase';

const generateId = () => Math.random().toString(36).substr(2, 9);

const saveToSupabase = async (plan: WeddingPlan) => {
    try {
        const { error } = await supabase
            .from('wedding_plans')
            .upsert({
                id: plan.id,
                name: plan.name,
                passcode: plan.passcode,
                data: plan
            });

        if (error) {
            console.error('Supabase save error:', error);
        } else {
            // Update last synced timestamp in store
            useStore.setState({ lastSynced: Date.now() });
        }
    } catch (err) {
        console.error('Supabase save error:', err);
    }
};

// Polling for auto-refresh
let pollInterval: ReturnType<typeof setInterval> | null = null;

export const useStore = create<Store>()((set, get) => ({
    currentPlan: null,
    lastSynced: null,
    guests: [],
    isLoading: false,

    createPlan: async (name: string, passcode: string) => {
        set({ isLoading: true });

        const newPlan: WeddingPlan = {
            id: generateId(),
            name,
            passcode,
            vendors: [],
            createdAt: Date.now(),
        };

        try {
            // Save to Supabase
            await saveToSupabase(newPlan);

            set({ currentPlan: newPlan, guests: [], isLoading: false });

            // Start polling for this plan
            get().startPolling();
        } catch (error) {
            console.error('Error creating plan:', error);
            set({ isLoading: false });
        }
    },

    login: async (name: string, passcode: string) => {
        set({ isLoading: true });

        try {
            const { data, error } = await supabase
                .from('wedding_plans')
                .select('data')
                .eq('name', name)
                .eq('passcode', passcode)
                .single();

            if (error || !data || !data.data) {
                set({ isLoading: false });
                return false;
            }

            const plan = data.data as WeddingPlan;
            set({ currentPlan: plan, isLoading: false });

            // Load guests for this plan
            await get().loadGuests(plan.id);

            // Start polling
            get().startPolling();

            return true;
        } catch (e) {
            console.error("Login error", e);
            set({ isLoading: false });
            return false;
        }
    },

    logout: () => {
        get().stopPolling();
        set({ currentPlan: null, guests: [], lastSynced: null });
    },

    addVendor: (name: string) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const newVendor: Vendor = {
            id: generateId(),
            name,
            tags: [],
            useSum: true,
            manualTotal: 0,
            selected: false,
        };

        const updatedPlan = {
            ...currentPlan,
            vendors: [...currentPlan.vendors, newVendor],
        };

        set({ currentPlan: updatedPlan });
    },

    updateVendor: (vendorId: string, updates: Partial<Vendor>) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.map((v) =>
                v.id === vendorId ? { ...v, ...updates } : v
            ),
        };

        set({ currentPlan: updatedPlan });
    },

    deleteVendor: (vendorId: string) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.filter((v) => v.id !== vendorId),
        };

        set({ currentPlan: updatedPlan });
    },

    toggleVendorSelection: (vendorId: string) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const vendor = currentPlan.vendors.find(v => v.id === vendorId);
        if (!vendor) return;

        const newSelected = !vendor.selected;

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.map((v) => {
                if (v.id === vendorId) {
                    // If selecting vendor, select all tags and items
                    if (newSelected) {
                        return {
                            ...v,
                            selected: true,
                            tags: v.tags.map(t => ({
                                ...t,
                                selected: true,
                                items: t.items.map(i => ({ ...i, selected: true }))
                            }))
                        };
                    }
                    // If deselecting vendor, deselect all tags and items
                    return {
                        ...v,
                        selected: false,
                        tags: v.tags.map(t => ({
                            ...t,
                            selected: false,
                            items: t.items.map(i => ({ ...i, selected: false }))
                        }))
                    };
                }
                return v;
            }),
        };

        set({
            currentPlan: updatedPlan,
        });
    },

    addTag: (vendorId: string, name: string) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const newTag: Tag = {
            id: generateId(),
            name,
            items: [],
            useSum: true,
            manualTotal: 0,
            selected: false,
        };

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.map((v) =>
                v.id === vendorId
                    ? { ...v, tags: [...v.tags, newTag] }
                    : v
            ),
        };

        set({
            currentPlan: updatedPlan,
        });
    },

    updateTag: (vendorId: string, tagId: string, updates: Partial<Tag>) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.map((v) =>
                v.id === vendorId
                    ? {
                        ...v,
                        tags: v.tags.map((t) =>
                            t.id === tagId ? { ...t, ...updates } : t
                        ),
                    }
                    : v
            ),
        };

        set({
            currentPlan: updatedPlan,
        });
    },

    deleteTag: (vendorId: string, tagId: string) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.map((v) =>
                v.id === vendorId
                    ? { ...v, tags: v.tags.filter((t) => t.id !== tagId) }
                    : v
            ),
        };

        set({
            currentPlan: updatedPlan,
        });
    },

    toggleTagSelection: (vendorId: string, tagId: string) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const vendor = currentPlan.vendors.find(v => v.id === vendorId);
        if (!vendor) return;

        const tag = vendor.tags.find(t => t.id === tagId);
        if (!tag) return;

        const newSelected = !tag.selected;

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.map((v) => {
                if (v.id === vendorId) {
                    const updatedTags = v.tags.map((t) => {
                        if (t.id === tagId) {
                            // If selecting tag, select all items
                            if (newSelected) {
                                return {
                                    ...t,
                                    selected: true,
                                    items: t.items.map(i => ({ ...i, selected: true }))
                                };
                            }
                            // If deselecting tag, deselect all items
                            return {
                                ...t,
                                selected: false,
                                items: t.items.map(i => ({ ...i, selected: false }))
                            };
                        }
                        return t;
                    });

                    // Auto-select vendor if tag is being selected
                    // Auto-deselect vendor if no tags are selected
                    const hasSelectedTags = updatedTags.some(t => t.selected);

                    return {
                        ...v,
                        tags: updatedTags,
                        selected: newSelected ? true : hasSelectedTags
                    };
                }
                return v;
            }),
        };

        set({
            currentPlan: updatedPlan,
        });
    },

    addItem: (
        vendorId: string,
        tagId: string,
        name: string,
        count: number,
        price: number
    ) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const newItem: Item = {
            id: generateId(),
            name,
            count,
            price,
            selected: false,
        };

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.map((v) =>
                v.id === vendorId
                    ? {
                        ...v,
                        tags: v.tags.map((t) =>
                            t.id === tagId
                                ? { ...t, items: [...t.items, newItem] }
                                : t
                        ),
                    }
                    : v
            ),
        };

        set({
            currentPlan: updatedPlan,
        });
    },

    updateItem: (
        vendorId: string,
        tagId: string,
        itemId: string,
        updates: Partial<Item>
    ) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.map((v) =>
                v.id === vendorId
                    ? {
                        ...v,
                        tags: v.tags.map((t) =>
                            t.id === tagId
                                ? {
                                    ...t,
                                    items: t.items.map((i) =>
                                        i.id === itemId ? { ...i, ...updates } : i
                                    ),
                                }
                                : t
                        ),
                    }
                    : v
            ),
        };

        set({
            currentPlan: updatedPlan,
        });
    },

    deleteItem: (vendorId: string, tagId: string, itemId: string) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.map((v) =>
                v.id === vendorId
                    ? {
                        ...v,
                        tags: v.tags.map((t) =>
                            t.id === tagId
                                ? { ...t, items: t.items.filter((i) => i.id !== itemId) }
                                : t
                        ),
                    }
                    : v
            ),
        };

        set({
            currentPlan: updatedPlan,
        });
    },

    toggleItemSelection: (vendorId: string, tagId: string, itemId: string) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const vendor = currentPlan.vendors.find(v => v.id === vendorId);
        if (!vendor) return;

        const tag = vendor.tags.find(t => t.id === tagId);
        if (!tag) return;

        const item = tag.items.find(i => i.id === itemId);
        if (!item) return;

        const newSelected = !item.selected;

        const updatedPlan = {
            ...currentPlan,
            vendors: currentPlan.vendors.map((v) => {
                if (v.id === vendorId) {
                    const updatedTags = v.tags.map((t) => {
                        if (t.id === tagId) {
                            const updatedItems = t.items.map((i) =>
                                i.id === itemId ? { ...i, selected: newSelected } : i
                            );

                            // Auto-select tag if item is being selected
                            // Auto-deselect tag if no items are selected
                            const hasSelectedItems = updatedItems.some(i => i.selected);

                            return {
                                ...t,
                                items: updatedItems,
                                selected: newSelected ? true : hasSelectedItems
                            };
                        }
                        return t;
                    });

                    // Auto-select vendor if any tag is selected
                    // Auto-deselect vendor if no tags are selected
                    const hasSelectedTags = updatedTags.some(t => t.selected);

                    return {
                        ...v,
                        tags: updatedTags,
                        selected: hasSelectedTags
                    };
                }
                return v;
            }),
        };

        set({
            currentPlan: updatedPlan,
        });
    },

    calculateBudget: () => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return 0;

        let total = 0;

        currentPlan.vendors.forEach((vendor) => {
            if (vendor.selected) {
                if (vendor.useSum) {
                    // Calculate from tags
                    vendor.tags.forEach((tag) => {
                        if (tag.selected) {
                            if (tag.useSum) {
                                // Calculate from items
                                tag.items.forEach((item) => {
                                    if (item.selected) {
                                        total += item.count * item.price;
                                    }
                                });
                            } else {
                                total += tag.manualTotal;
                            }
                        }
                    });
                } else {
                    total += vendor.manualTotal;
                }
            }
        });

        return total;
    },

    loadPlanById: async (planId: string, passcode: string) => {
        set({ isLoading: true });

        try {
            const { data, error } = await supabase
                .from('wedding_plans')
                .select('data')
                .eq('id', planId)
                .eq('passcode', passcode)
                .single();

            if (error || !data || !data.data) {
                set({ isLoading: false });
                return false;
            }

            const plan = data.data as WeddingPlan;
            set({ currentPlan: plan, isLoading: false });

            // Load guests for this plan
            await get().loadGuests(planId);

            // Start polling
            get().startPolling();

            return true;
        } catch (e) {
            console.error("Load plan error", e);
            set({ isLoading: false });
            return false;
        }
    },

    refreshPlan: async () => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        try {
            const { data, error } = await supabase
                .from('wedding_plans')
                .select('data')
                .eq('id', currentPlan.id)
                .eq('passcode', currentPlan.passcode)
                .single();

            if (!error && data && data.data) {
                const plan = data.data as WeddingPlan;
                set({ currentPlan: plan });

                // Also refresh guests
                await get().loadGuests(currentPlan.id);
            }
        } catch (e) {
            console.error('Refresh plan error:', e);
        }
    },

    startPolling: () => {
        // Stop any existing polling
        get().stopPolling();

        // Start new polling interval (15 seconds)
        pollInterval = setInterval(async () => {
            await get().refreshPlan();
        }, 15000);
    },

    stopPolling: () => {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    },

    addGuest: async (name: string, occupancy: number, tag: string) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        const guestId = generateId();
        const newGuest: Guest = {
            id: guestId,
            name,
            occupancy,
            tag,
            selected: true
        };

        // Add to state immediately for better UX
        set({
            guests: [...get().guests, newGuest]
        });

        // Save to Supabase in background
        try {
            const { error } = await supabase
                .from('wedding_guests')
                .insert({
                    id: guestId,
                    plan_id: currentPlan.id,
                    name,
                    occupancy,
                    tag,
                    selected: true
                });

            if (error) {
                console.error('Error adding guest:', error);
                // Rollback on error
                set({
                    guests: get().guests.filter((g: Guest) => g.id !== guestId)
                });
            }
        } catch (err) {
            console.error('Error adding guest:', err);
            // Rollback on error
            set({
                guests: get().guests.filter((g: Guest) => g.id !== guestId)
            });
        }
    },

    updateGuest: async (guestId: string, updates: Partial<Guest>) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        try {
            const { error } = await supabase
                .from('wedding_guests')
                .update(updates)
                .eq('id', guestId)
                .eq('plan_id', currentPlan.id);

            if (error) {
                console.error('Error updating guest:', error);
                return;
            }

            set({
                guests: get().guests.map((g: Guest) =>
                    g.id === guestId ? { ...g, ...updates } : g
                )
            });
        } catch (err) {
            console.error('Error updating guest:', err);
        }
    },

    deleteGuest: async (guestId: string) => {
        const currentPlan = get().currentPlan;
        if (!currentPlan) return;

        try {
            const { error } = await supabase
                .from('wedding_guests')
                .delete()
                .eq('id', guestId)
                .eq('plan_id', currentPlan.id);

            if (error) {
                console.error('Error deleting guest:', error);
                return;
            }

            set({
                guests: get().guests.filter((g: Guest) => g.id !== guestId)
            });
        } catch (err) {
            console.error('Error deleting guest:', err);
        }
    },

    loadGuests: async (planId: string) => {
        try {
            const { data, error } = await supabase
                .from('wedding_guests')
                .select('*')
                .eq('plan_id', planId);

            if (error) {
                console.error('Error loading guests:', error);
                return;
            }

            if (data) {
                const guests: Guest[] = data.map((row: any) => ({
                    id: row.id,
                    name: row.name,
                    occupancy: row.occupancy,
                    tag: row.tag,
                    selected: row.selected !== undefined ? row.selected : true
                }));

                set({ guests });
            }
        } catch (err) {
            console.error('Error loading guests:', err);
        }
    },
}));

// Debounced save to prevent excessive API calls during rapid state changes
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSaveToSupabase = (plan: WeddingPlan) => {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
        saveToSupabase(plan);
        saveTimeout = null;
    }, 500); // Wait 500ms after last change before syncing
};

// Subscribe to changes and sync to Supabase (debounced)
useStore.subscribe((state) => {
    if (state.currentPlan) {
        debouncedSaveToSupabase(state.currentPlan);
    }
});
