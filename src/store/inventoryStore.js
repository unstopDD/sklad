import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Color tokens
export const COLORS = {
    critical: '#EF4444',  // Out of Stock
    warning: '#F59E0B',   // Low Stock
    success: '#10B981',   // Normal
    darkBg: '#1F2937',    // Dark mode background
};

// Default units
const DEFAULT_UNITS = ['кг', 'г', 'л', 'мл', 'шт', 'м', 'м²'];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const now = () => new Date().toISOString();

// Cleanup old localStorage (migrate from StoreContext)
if (typeof window !== 'undefined') {
    const oldUnits = localStorage.getItem('sklad_units');
    const oldIngredients = localStorage.getItem('sklad_ingredients');
    const oldProducts = localStorage.getItem('sklad_products');
    const oldHistory = localStorage.getItem('sklad_history');

    // Remove old keys to prevent conflicts
    if (oldUnits || oldIngredients || oldProducts || oldHistory) {
        localStorage.removeItem('sklad_units');
        localStorage.removeItem('sklad_ingredients');
        localStorage.removeItem('sklad_products');
        localStorage.removeItem('sklad_history');
        // We do NOT clear 'sklad-storage' here anymore to strictly preserve user settings (like Theme)
    }
}

export const useInventoryStore = create(
    persist(
        (set, get) => ({
            // State
            units: DEFAULT_UNITS,
            ingredients: [],
            products: [],
            history: [],
            darkMode: false,


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
            toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),

            // Log action to history
            logAction: (type, description) => {
                set(state => ({
                    history: [{
                        id: generateId(),
                        date: now(),
                        type,
                        description
                    }, ...state.history.slice(0, 99)] // Keep last 100
                }));
            },

            // Units
            addUnit: (unit) => {
                if (!get().units.includes(unit)) {
                    set(state => ({ units: [...state.units, unit] }));
                }
            },
            removeUnit: (unit) => set(state => ({
                units: state.units.filter(u => u !== unit)
            })),

            // Ingredients with optimistic updates
            addIngredient: (ingredient) => {
                const ingredients = get().ingredients;
                const normalize = (str) => str.trim().toLowerCase();
                const existing = ingredients.find(i => normalize(i.name) === normalize(ingredient.name));

                if (existing && existing.id !== ingredient.id) {
                    get().addToast(`Сырьё "${ingredient.name}" уже существует`, 'error');
                    return { success: false };
                }

                const newIngredient = ingredient.id
                    ? ingredient
                    : { ...ingredient, id: generateId() };

                if (ingredient.id) {
                    // Update
                    set(state => ({
                        ingredients: state.ingredients.map(i =>
                            i.id === ingredient.id ? ingredient : i
                        )
                    }));
                    get().logAction('Обновление', `Обновлен: ${ingredient.name}`);
                } else {
                    // Create
                    set(state => ({
                        ingredients: [...state.ingredients, newIngredient]
                    }));
                    get().logAction('Создание', `Добавлен: ${newIngredient.name} (${newIngredient.quantity} ${newIngredient.unit})`);
                }
                return { success: true, ingredient: newIngredient };
            },

            updateIngredientQuantity: (id, newQuantity) => {
                set(state => ({
                    ingredients: state.ingredients.map(i =>
                        i.id === id ? { ...i, quantity: newQuantity } : i
                    )
                }));
            },

            removeIngredient: (id) => {
                const name = get().ingredients.find(i => i.id === id)?.name;
                set(state => ({
                    ingredients: state.ingredients.filter(i => i.id !== id)
                }));
                get().logAction('Удаление', `Удален: ${name}`);
            },

            // Products
            addProduct: (product) => {
                const products = get().products;
                const normalize = (str) => str.trim().toLowerCase();
                const existing = products.find(p => normalize(p.name) === normalize(product.name));

                if (existing && existing.id !== product.id) {
                    get().addToast(`Продукт "${product.name}" уже существует`, 'error');
                    return { success: false };
                }

                if (product.id) {
                    set(state => ({
                        products: state.products.map(p =>
                            p.id === product.id ? product : p
                        )
                    }));
                    return { success: true };
                } else {
                    const newProduct = { ...product, id: generateId() };
                    set(state => ({
                        products: [...state.products, newProduct]
                    }));
                    get().logAction('Создание', `Создан продукт: ${newProduct.name}`);
                    return { success: true, product: newProduct };
                }
            },

            removeProduct: (id) => {
                const name = get().products.find(p => p.id === id)?.name;
                set(state => ({
                    products: state.products.filter(p => p.id !== id)
                }));
                get().logAction('Удаление', `Удален продукт: ${name}`);
            },

            // Production
            produceProduct: (productId, quantity) => {
                const product = get().products.find(p => p.id === productId);
                if (!product) return { success: false, error: 'Продукт не найден' };

                const ingredients = get().ingredients;
                const missing = [];

                product.recipe?.forEach(item => {
                    const required = item.amount * quantity;
                    const stock = ingredients.find(i => i.id === item.ingredientId);
                    if (!stock || stock.quantity < required) {
                        missing.push(stock?.name || 'Неизвестный');
                    }
                });

                if (missing.length > 0) {
                    return { success: false, error: `Не хватает: ${missing.join(', ')}` };
                }

                // Deduct stock
                set(state => ({
                    ingredients: state.ingredients.map(ing => {
                        const recipeItem = product.recipe?.find(r => r.ingredientId === ing.id);
                        if (recipeItem) {
                            return { ...ing, quantity: ing.quantity - (recipeItem.amount * quantity) };
                        }
                        return ing;
                    })
                }));

                get().logAction('Производство', `Произведено ${quantity} ${product.unit || 'шт'} "${product.name}"`);
                return { success: true };
            },

            // Bulk operations
            clearHistory: () => set({ history: [] }),
        }),
        {
            name: 'sklad-storage',
            partialize: (state) => ({
                units: state.units,
                ingredients: state.ingredients,
                products: state.products,
                history: state.history,
                darkMode: state.darkMode,
                // toasts intentionally excluded - they are ephemeral
            }),
        }
    )
);
