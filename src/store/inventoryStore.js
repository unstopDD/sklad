import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Color tokens
export const COLORS = {
    critical: '#EF4444',  // Out of Stock
    warning: '#F59E0B',   // Low Stock
    success: '#10B981',   // Normal
    darkBg: '#1F2937',    // Dark mode background
};

// Default units to seed if DB is empty
const DEFAULT_UNITS = ['кг', 'г', 'л', 'мл', 'шт', 'м', 'м²'];

// Helper to generate IDs (still useful for optimistic UI or temp IDs)
const generateId = () => Math.random().toString(36).substr(2, 9);
const now = () => new Date().toISOString();

export const useInventoryStore = create((set, get) => ({
    // State
    units: [],
    ingredients: [],
    products: [],
    history: [],
    darkMode: localStorage.getItem('sklad_theme') === 'dark', // Keep theme local
    loading: false,
    error: null,
    user: null, // Auth state
    profile: null, // User Profile (Production Name etc)

    // Auth Actions
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),

    checkProfile: async (userId) => {
        if (!userId) {
            console.warn('[checkProfile] No userId provided');
            return false;
        }

        console.log('[checkProfile] Checking for userId:', userId);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            console.log('[checkProfile] Result:', { data, error });

            if (error) {
                console.error('[checkProfile] Supabase error:', error);
                throw error; // Let App.jsx catch this
            }

            if (data) {
                set({ profile: data });
                return true;
            }

            return false;
        } catch (e) {
            console.error('[checkProfile] Exception:', e);
            throw e;
        }
    },

    updateProductionName: async (newName) => {
        const userId = get().user?.id;
        if (!userId) return { success: false };

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ production_name: newName })
                .eq('id', userId);

            if (error) throw error;

            set(state => ({
                profile: { ...state.profile, production_name: newName }
            }));

            get().addToast('Название обновлено', 'success');
            return { success: true };
        } catch (e) {
            console.error('[updateProductionName] Error:', e);
            get().addToast('Ошибка обновления названия', 'error');
            return { success: false };
        }
    },

    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Clear application state but preserve theme
            const theme = get().darkMode;

            set({
                user: null,
                profile: null,
                ingredients: [],
                products: [],
                units: [],
                history: [],
                toasts: [],
                error: null
            });

            // Preserve theme in localStorage
            localStorage.setItem('sklad_theme', theme ? 'dark' : 'light');

            // onAuthStateChange in App.jsx will handle the redirect to /login
            // No need for window.location.href - let React Router handle it
        } catch (error) {
            console.error('Sign out error:', error);
            get().addToast('Ошибка при выходе', 'error');
            throw error;
        }
    },

    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    register: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    },

    // Toast notifications
    toasts: [],
    addToast: (message, type = 'info') => {
        const id = generateId();
        set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
            set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
        }, 3000);
    },

    // Dark mode toggle
    toggleDarkMode: () => {
        set(state => {
            const newMode = !state.darkMode;
            localStorage.setItem('sklad_theme', newMode ? 'dark' : 'light');
            if (newMode) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            return { darkMode: newMode };
        });
    },

    // Initialize Data
    fetchInitialData: async () => {
        set({ loading: true, error: null });
        try {
            const [unitsRes, ingredientsRes, productsRes, historyRes] = await Promise.all([
                supabase.from('units').select('*').order('created_at'),
                supabase.from('ingredients').select('*').order('created_at'),
                supabase.from('products').select('*').order('created_at'),
                supabase.from('history').select('*').order('date', { ascending: false }).limit(100)
            ]);

            if (unitsRes.error) throw unitsRes.error;
            if (ingredientsRes.error) throw ingredientsRes.error;
            if (productsRes.error) throw productsRes.error;
            if (historyRes.error) throw historyRes.error;

            // Seed units if empty
            let units = unitsRes.data.map(u => u.name);
            if (units.length === 0) {
                const userId = get().user?.id;
                if (userId) {
                    // Use upsert with ignoreDuplicates to prevent 409 errors
                    const unitsToInsert = DEFAULT_UNITS.map(name => ({
                        name,
                        user_id: userId
                    }));

                    const { error } = await supabase
                        .from('units')
                        .upsert(unitsToInsert, { onConflict: 'name, user_id', ignoreDuplicates: true });

                    if (!error) {
                        units = DEFAULT_UNITS;
                    } else {
                        console.warn('[Store] Failed to seed units:', error.message);
                    }
                }
            }

            set({
                units,
                ingredients: ingredientsRes.data.map(i => ({ ...i, minStock: i.min_stock })),
                products: productsRes.data,
                history: historyRes.data,
                loading: false
            });
        } catch (err) {
            console.error('Error fetching data:', err);
            set({ error: err.message, loading: false });
            get().addToast('Ошибка загрузки данных', 'error');
        }
    },

    // Units
    addUnit: async (unitName) => {
        if (get().units.includes(unitName)) return;
        const userId = get().user?.id;
        if (!userId) return;

        // Optimistic
        set(state => ({ units: [...state.units, unitName] }));

        const { error } = await supabase.from('units').insert({ name: unitName, user_id: userId });
        if (error) {
            get().addToast('Ошибка сохранения единицы', 'error');
            // Revert
            set(state => ({ units: state.units.filter(u => u !== unitName) }));
        }
    },

    removeUnit: async (unitName) => {
        // Optimistic
        const previousUnits = get().units;
        set(state => ({ units: state.units.filter(u => u !== unitName) }));

        const { error } = await supabase.from('units').delete().eq('name', unitName);
        if (error) {
            get().addToast('Ошибка удаления единицы', 'error');
            set({ units: previousUnits });
        }
    },

    // Ingredients
    addIngredient: async (ingredient) => {
        const ingredients = get().ingredients;
        const normalize = (str) => str.trim().toLowerCase();
        const existing = ingredients.find(i => normalize(i.name) === normalize(ingredient.name));

        if (existing && existing.id !== ingredient.id) {
            get().addToast(`Сырьё "${ingredient.name}" уже существует`, 'error');
            return { success: false };
        }

        // Prepare DB payload (map camelCase to snake_case)
        const userId = get().user?.id;
        if (!userId) return { success: false };

        const dbPayload = {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            min_stock: ingredient.minStock,
            user_id: userId
        };

        if (ingredient.id) {
            // Update
            const { error } = await supabase
                .from('ingredients')
                .update(dbPayload)
                .eq('id', ingredient.id);

            if (error) {
                get().addToast('Ошибка обновления', 'error');
                return { success: false };
            }

            set(state => ({
                ingredients: state.ingredients.map(i => i.id === ingredient.id ? ingredient : i)
            }));
            await get().logAction('Обновление', `Обновлен: ${ingredient.name}`);
        } else {
            // Create
            const { data, error } = await supabase
                .from('ingredients')
                .insert([dbPayload])
                .select()
                .single();

            if (error) {
                console.error("Supabase Error:", error);
                get().addToast('Ошибка создания: ' + error.message, 'error');
                return { success: false };
            }

            // Map back to JS
            const newIngredient = { ...data, minStock: data.min_stock };

            set(state => ({ ingredients: [...state.ingredients, newIngredient] }));
            await get().logAction('Создание', `Добавлен: ${newIngredient.name} (${newIngredient.quantity} ${newIngredient.unit})`);
            return { success: true, ingredient: newIngredient };
        }
        return { success: true };
    },

    updateIngredientQuantity: async (id, newQuantity) => {
        const { error } = await supabase
            .from('ingredients')
            .update({ quantity: newQuantity })
            .eq('id', id);

        if (!error) {
            set(state => ({
                ingredients: state.ingredients.map(i => i.id === id ? { ...i, quantity: newQuantity } : i)
            }));
        } else {
            get().addToast('Ошибка обновления остатка', 'error');
        }
    },

    removeIngredient: async (id) => {
        const ing = get().ingredients.find(i => i.id === id);
        const { error } = await supabase.from('ingredients').delete().eq('id', id);

        if (!error) {
            set(state => ({ ingredients: state.ingredients.filter(i => i.id !== id) }));
            await get().logAction('Удаление', `Удален: ${ing?.name}`);
        } else {
            get().addToast('Ошибка удаления', 'error');
        }
    },

    // Products
    addProduct: async (product) => {
        const products = get().products;
        const normalize = (str) => str.trim().toLowerCase();
        const existing = products.find(p => normalize(p.name) === normalize(product.name));

        if (existing && existing.id !== product.id) {
            get().addToast(`Продукт "${product.name}" уже существует`, 'error');
            return { success: false };
        }

        const userId = get().user?.id;
        if (!userId) return { success: false };

        // Clean data for DB (remove warnings and other non-DB fields)
        const { id, warnings, ...dataForDB } = product;

        if (id) {
            // Update
            const { data, error } = await supabase
                .from('products')
                .update(dataForDB)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error("Update Product Error:", error);
                get().addToast('Ошибка обновления продукта', 'error');
                return { success: false };
            }

            // Update local state with the exact data from DB
            set(state => ({
                products: state.products.map(p => p.id === id ? data : p)
            }));
            await get().logAction('Обновление', `Обновлен продукт: ${data.name}`);
        } else {
            // Create
            const { data, error } = await supabase
                .from('products')
                .insert([{ ...dataForDB, user_id: userId }])
                .select()
                .single();

            if (error) {
                console.error("Create Product Error:", error);
                get().addToast('Ошибка создания продукта', 'error');
                return { success: false };
            }
            set(state => ({ products: [...state.products, data] }));
            await get().logAction('Создание', `Создан продукт: ${data.name}`);
            return { success: true, product: data };
        }
        return { success: true };
    },

    removeProduct: async (id) => {
        const prod = get().products.find(p => p.id === id);
        const { error } = await supabase.from('products').delete().eq('id', id);

        if (!error) {
            set(state => ({ products: state.products.filter(p => p.id !== id) }));
            await get().logAction('Удаление', `Удален продукт: ${prod?.name}`);
        } else {
            get().addToast('Ошибка удаления продукта', 'error');
        }
    },

    // Production
    produceProduct: async (productId, quantity) => {
        const product = get().products.find(p => p.id === productId);
        if (!product) return { success: false, error: 'Продукт не найден' };

        const ingredients = get().ingredients;
        const updates = [];
        const missing = [];

        // Check stock locally first
        product.recipe?.forEach(item => {
            const required = item.amount * quantity;
            const stock = ingredients.find(i => i.id === item.ingredientId);
            if (!stock || stock.quantity < required) {
                missing.push(stock?.name || 'Неизвестный');
            } else {
                updates.push({ id: stock.id, newQuantity: stock.quantity - required });
            }
        });

        if (missing.length > 0) {
            return { success: false, error: `Не хватает: ${missing.join(', ')}` };
        }

        try {
            // Deduct ingredients
            await Promise.all(updates.map(u =>
                supabase.from('ingredients').update({ quantity: u.newQuantity }).eq('id', u.id)
            ));

            // Increment product stock
            const currentProdQty = product.quantity || 0;
            const newProdQty = currentProdQty + quantity;

            // We attempt to update product quantity.
            const { error: prodError } = await supabase.from('products').update({ quantity: newProdQty }).eq('id', productId);
            if (prodError) throw prodError;

            // Update local state
            set(state => ({
                ingredients: state.ingredients.map(ing => {
                    const update = updates.find(u => u.id === ing.id);
                    return update ? { ...ing, quantity: update.newQuantity } : ing;
                }),
                products: state.products.map(p => p.id === productId ? { ...p, quantity: newProdQty } : p)
            }));

            await get().logAction('Производство', `Произведено ${quantity} ${product.unit || 'шт'} "${product.name}"`);
            return { success: true };
        } catch (err) {
            console.error(err);
            get().addToast('Ошибка при производстве', 'error');
            return { success: false, error: 'Сбой базы данных' };
        }
    },

    updateProductQuantity: async (id, newQuantity) => {
        const prod = get().products.find(p => p.id === id);
        const { error } = await supabase
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', id);

        if (!error) {
            set(state => ({
                products: state.products.map(p => p.id === id ? { ...p, quantity: newQuantity } : p)
            }));
        } else {
            get().addToast('Ошибка обновления остатка продукта', 'error');
        }
    },



    // History Log
    logAction: async (type, description) => {
        const userId = get().user?.id;
        const newEntry = {
            type,
            description,
            date: now(),
            user_id: userId
        };

        // Optimistic
        set(state => ({
            history: [newEntry, ...state.history].slice(0, 100)
        }));

        // DB Insert
        if (userId) {
            const { error } = await supabase.from('history').insert(newEntry);
            if (error) console.error('Failed to log history', error);
        }
    },

    clearHistory: async () => {
        set({ history: [] });
        await supabase.from('history').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    }
}));
