import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store, WeddingPlan, Vendor, Tag, Item } from './types';

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

export const useStore = create<Store>()(
    persist(
        (set, get) => ({
            plans: [],
            currentPlan: null,
            lastSynced: null,

            createPlan: async (name: string, passcode: string) => {
                const newPlan: WeddingPlan = {
                    id: generateId(),
                    name,
                    passcode,
                    vendors: [],
                    createdAt: Date.now(),
                };

                // Save to Supabase
                await saveToSupabase(newPlan);

                set((state) => ({
                    plans: [...state.plans, newPlan],
                    currentPlan: newPlan,
                }));
            },

            login: async (name: string, passcode: string) => {
                // First check local
                const localPlan = get().plans.find(
                    (p) => p.name === name && p.passcode === passcode
                );

                if (localPlan) {
                    set({ currentPlan: localPlan });
                    // Background sync check
                    try {
                        const { data } = await supabase
                            .from('wedding_plans')
                            .select('data')
                            .eq('name', name)
                            .eq('passcode', passcode)
                            .single();

                        if (data && data.data) {
                            const remotePlan = data.data as WeddingPlan;
                            // Simple conflict resolution: Remote wins if IDs match
                            if (remotePlan.id === localPlan.id) {
                                set((state) => ({
                                    currentPlan: remotePlan,
                                    plans: state.plans.map(p => p.id === remotePlan.id ? remotePlan : p)
                                }));
                            }
                        }
                    } catch (e) {
                        console.error("Sync error", e);
                    }
                    return true;
                }

                // If not local, try remote
                try {
                    const { data } = await supabase
                        .from('wedding_plans')
                        .select('data')
                        .eq('name', name)
                        .eq('passcode', passcode)
                        .single();

                    if (data && data.data) {
                        const plan = data.data as WeddingPlan;
                        set((state) => ({
                            plans: [...state.plans, plan],
                            currentPlan: plan
                        }));
                        return true;
                    }
                } catch (e) {
                    console.error("Login error", e);
                }

                return false;
            },

            logout: () => set({ currentPlan: null }),

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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
            },

            deleteVendor: (vendorId: string) => {
                const currentPlan = get().currentPlan;
                if (!currentPlan) return;

                const updatedPlan = {
                    ...currentPlan,
                    vendors: currentPlan.vendors.filter((v) => v.id !== vendorId),
                };

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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

                set((state) => ({
                    currentPlan: updatedPlan,
                    plans: state.plans.map((p) =>
                        p.id === currentPlan.id ? updatedPlan : p
                    ),
                }));
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
        }),
        {
            name: 'wedding-planner-storage',
        }
    )
);

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
