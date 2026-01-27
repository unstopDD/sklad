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
    profile: null, // User Profile (Production Name, Plan etc)

    // Plan Limits
    PLAN_LIMITS: {
        free: { materials: 15, products: 5, historyDays: 30 },
        starter: { materials: 70, products: 30, historyDays: null },
        pro: { materials: 150, products: 50, historyDays: null },
        business: { materials: Infinity, products: Infinity, historyDays: null }
    },

    PLAN_RANK: {
        free: 0,
        starter: 1,
        pro: 2,
        business: 3
    },

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

    updateCurrency: async (newCurrency) => {
        const userId = get().user?.id;
        if (!userId) return { success: false };

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ currency: newCurrency })
                .eq('id', userId);

            if (error) throw error;

            set(state => ({
                profile: { ...state.profile, currency: newCurrency }
            }));

            get().addToast('Валюта обновлена', 'success');
            return { success: true };
        } catch (e) {
            console.error('[updateCurrency] Error:', e);
            get().addToast('Ошибка обновления валюты', 'error');
            return { success: false };
        }
    },

    updatePlan: async (newPlan) => {
        const userId = get().user?.id;
        if (!userId) return { success: false };

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ subscription_plan: newPlan })
                .eq('id', userId);

            if (error) throw error;

            set(state => ({
                profile: { ...state.profile, subscription_plan: newPlan }
            }));

            get().addToast(`План обновлен до ${newPlan.toUpperCase()}`, 'success');
            return { success: true };
        } catch (e) {
            console.error('[updatePlan] Error:', e);
            get().addToast('Ошибка обновления плана', 'error');
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
        const userId = get().user?.id;
        if (!userId) {
            set({ loading: false });
            return;
        }

        try {
            const [unitsRes, ingredientsRes, productsRes, historyRes] = await Promise.all([
                supabase.from('units').select('*').eq('user_id', userId).order('created_at'),
                supabase.from('ingredients').select('*').eq('user_id', userId).order('created_at'),
                supabase.from('products').select('*').eq('user_id', userId).order('created_at'),
                supabase.from('history').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(100)
            ]);

            if (unitsRes.error) throw unitsRes.error;
            if (ingredientsRes.error) throw ingredientsRes.error;
            if (productsRes.error) throw productsRes.error;
            if (historyRes.error) throw historyRes.error;

            // Seed units if empty
            let units = unitsRes.data.map(u => u.name);
            if (units.length === 0) {
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
                ingredients: ingredientsRes.data.map(i => ({
                    ...i,
                    minStock: i.min_stock,
                    pricePerUnit: i.price_per_unit || 0,
                    packingName: i.packing_name,
                    packingSize: i.packing_size
                })),
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
        const userId = get().user?.id;
        if (!userId) return;

        // Optimistic
        const previousUnits = get().units;
        set(state => ({ units: state.units.filter(u => u !== unitName) }));

        const { error } = await supabase.from('units').delete().eq('name', unitName).eq('user_id', userId);
        if (error) {
            get().addToast('Ошибка удаления единицы', 'error');
            set({ units: previousUnits });
        }
    },

    // Ingredients
    addIngredient: async (ingredient) => {
        const ingredients = get().ingredients;
        const normalize = (str) => str?.toString().trim().toLowerCase() || '';

        // Search for existing by external_code first, then by name
        let existing = null;
        if (ingredient.external_code) {
            existing = ingredients.find(i => i.external_code === ingredient.external_code);
        }

        if (!existing) {
            existing = ingredients.find(i => normalize(i.name) === normalize(ingredient.name));
        }

        const userId = get().user?.id;
        if (!userId) return { success: false };

        const targetId = ingredient.id || existing?.id;
        const isSupplyMode = ingredient.isSupplyMode;

        // Prepare DB payload
        const finalQuantity = (isSupplyMode && targetId)
            ? ((existing?.quantity || 0) + (Number(ingredient.quantity) || 0))
            : ingredient.quantity;

        const dbPayload = {
            name: ingredient.name,
            quantity: finalQuantity,
            unit: ingredient.unit,
            min_stock: ingredient.minStock,
            price_per_unit: ingredient.pricePerUnit || 0,
            external_code: ingredient.external_code || null,
            packing_name: ingredient.packingName || null,
            packing_size: Number(ingredient.packingSize) || 0,
            user_id: userId
        };

        // Limit Check for NEW ingredients
        if (!ingredient.id) {
            const plan = get().profile?.subscription_plan || 'free';
            const limit = get().PLAN_LIMITS[plan].materials;
            if (get().ingredients.length >= limit) {
                get().addToast(`Лимит материалов для плана ${plan.toUpperCase()} исчерпан (${limit})`, 'error');
                return { success: false, error: 'limit_reached' };
            }
        }

        if (targetId) {
            // Update
            const { error } = await supabase
                .from('ingredients')
                .update(dbPayload)
                .eq('id', targetId)
                .eq('user_id', userId);

            if (error) {
                get().addToast('Ошибка обновления', 'error');
                return { success: false };
            }

            set(state => ({
                ingredients: state.ingredients.map(i => i.id === targetId ? { ...i, ...ingredient, quantity: finalQuantity, id: targetId } : i)
            }));
            await get().logAction('Обновление', `Обновлен: ${ingredient.name}`);
            return { success: true, updated: true };
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
            const newIngredient = {
                ...data,
                minStock: data.min_stock,
                pricePerUnit: data.price_per_unit || 0,
                packingName: data.packing_name,
                packingSize: data.packing_size
            };

            set(state => ({ ingredients: [...state.ingredients, newIngredient] }));
            await get().logAction('Создание', `Добавлен: ${newIngredient.name} (${newIngredient.quantity} ${newIngredient.unit})`);
            return { success: true, ingredient: newIngredient };
        }
        return { success: true };
    },

    updateIngredientQuantity: async (id, newQuantity) => {
        const userId = get().user?.id;
        if (!userId) return;

        const { error } = await supabase
            .from('ingredients')
            .update({ quantity: newQuantity })
            .eq('id', id)
            .eq('user_id', userId);

        if (!error) {
            set(state => ({
                ingredients: state.ingredients.map(i => i.id === id ? { ...i, quantity: newQuantity } : i)
            }));
        } else {
            get().addToast('Ошибка обновления остатка', 'error');
        }
    },

    incrementIngredientByPack: async (id, packsCount = 1) => {
        const userId = get().user?.id;
        if (!userId) return { success: false };

        const ing = get().ingredients.find(i => i.id === id);
        if (!ing || !ing.packingSize) return { success: false };

        const increment = packsCount * ing.packingSize;
        const newQuantity = (ing.quantity || 0) + increment;

        const { error } = await supabase
            .from('ingredients')
            .update({ quantity: newQuantity })
            .eq('id', id)
            .eq('user_id', userId);

        if (!error) {
            set(state => ({
                ingredients: state.ingredients.map(i => i.id === id ? { ...i, quantity: newQuantity } : i)
            }));
            // We return info to the component so it can handle localized toast
            return {
                success: true,
                increment,
                unit: ing.unit,
                packingName: ing.packingName,
                ingredientName: ing.name
            };
        } else {
            return { success: false, error: 'db_error' };
        }
    },

    removeIngredient: async (id) => {
        const userId = get().user?.id;
        if (!userId) return;

        const ing = get().ingredients.find(i => i.id === id);
        const { error } = await supabase.from('ingredients').delete().eq('id', id).eq('user_id', userId);

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
        const normalize = (str) => str?.toString().trim().toLowerCase() || '';

        // Search existing
        let existing = null;
        if (product.external_code) {
            existing = products.find(p => p.external_code === product.external_code);
        }
        if (!existing) {
            existing = products.find(p => normalize(p.name) === normalize(product.name));
        }

        const userId = get().user?.id;
        if (!userId) return { success: false };

        // Limit Check for NEW products
        if (!product.id) {
            const plan = get().profile?.subscription_plan || 'free';
            const limit = get().PLAN_LIMITS[plan].products;
            if (get().products.length >= limit) {
                get().addToast(`Лимит продуктов для плана ${plan.toUpperCase()} исчерпан (${limit})`, 'error');
                return { success: false, error: 'limit_reached' };
            }
        }

        // Clean data for DB
        const { id, warnings, isSupplyMode, ...dataForDB } = product;
        const targetId = id || existing?.id;

        if (isSupplyMode && targetId) {
            dataForDB.quantity = (Number(existing?.quantity) || 0) + (Number(product.quantity) || 0);
        }

        if (targetId) {
            // Update
            const { data, error } = await supabase
                .from('products')
                .update({ ...dataForDB, user_id: userId })
                .eq('id', targetId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                console.error("Update Product Error:", error);
                get().addToast('Ошибка обновления продукта', 'error');
                return { success: false };
            }

            // Update local state with the exact data from DB
            set(state => ({
                products: state.products.map(p => p.id === targetId ? data : p)
            }));
            await get().logAction('Обновление', `Обновлен продукт: ${data.name}`);
            return { success: true, updated: true };
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
        const userId = get().user?.id;
        if (!userId) return;

        const prod = get().products.find(p => p.id === id);
        const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', userId);

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
            const userId = get().user?.id;
            if (!userId) throw new Error('User not authenticated');

            // Deduct ingredients
            await Promise.all(updates.map(u =>
                supabase.from('ingredients')
                    .update({ quantity: u.newQuantity })
                    .eq('id', u.id)
                    .eq('user_id', userId)
            ));

            // Increment product stock
            const currentProdQty = product.quantity || 0;
            const newProdQty = currentProdQty + quantity;

            // We attempt to update product quantity.
            const { error: prodError } = await supabase.from('products')
                .update({ quantity: newProdQty })
                .eq('id', productId)
                .eq('user_id', userId);
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
        const userId = get().user?.id;
        if (!userId) return;

        const prod = get().products.find(p => p.id === id);
        const { error } = await supabase
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', id)
            .eq('user_id', userId);

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
        const userId = get().user?.id;
        if (!userId) return;

        set({ history: [] });
        await supabase.from('history').delete().eq('user_id', userId);
    },

    // Cost Calculation Helpers
    calculateProductCost: (productId) => {
        const product = get().products.find(p => p.id === productId);
        if (!product || !product.recipe) return 0;

        return product.recipe.reduce((total, item) => {
            const ingredient = get().ingredients.find(i => i.id === item.ingredientId);
            if (!ingredient) return total;
            return total + (ingredient.pricePerUnit * item.amount);
        }, 0);
    }
}));
