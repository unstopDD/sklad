import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

const DEFAULTS = {
    units: ['кг', 'г', 'л', 'мл', 'шт', 'м', 'м²'],
    ingredients: [],
    products: [],
    history: []
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date) => new Date(date).toLocaleString('ru-RU');

export const StoreProvider = ({ children }) => {
    // Initialize state
    const [units, setUnits] = useState(() => {
        const saved = localStorage.getItem('sklad_units');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration: If we detect the old 'kg' (English) default, auto-upgrade to Russian
            if (parsed.includes('kg') && !parsed.includes('кг')) {
                return DEFAULTS.units;
            }
            return parsed;
        }
        return DEFAULTS.units;
    });

    const [ingredients, setIngredients] = useState(() => {
        const saved = localStorage.getItem('sklad_ingredients');
        return saved ? JSON.parse(saved) : DEFAULTS.ingredients;
    });

    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('sklad_products');
        return saved ? JSON.parse(saved) : DEFAULTS.products;
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('sklad_history');
        return saved ? JSON.parse(saved) : DEFAULTS.history;
    });

    // Persistence
    useEffect(() => localStorage.setItem('sklad_units', JSON.stringify(units)), [units]);
    useEffect(() => localStorage.setItem('sklad_ingredients', JSON.stringify(ingredients)), [ingredients]);
    useEffect(() => localStorage.setItem('sklad_products', JSON.stringify(products)), [products]);
    useEffect(() => localStorage.setItem('sklad_history', JSON.stringify(history)), [history]);

    // Logging
    const logAction = (type, description) => {
        setHistory(prev => [{
            id: generateId(),
            date: new Date().toISOString(),
            type,
            description
        }, ...prev]);
    };

    // Actions
    const addUnit = (unit) => {
        if (!units.includes(unit)) setUnits([...units, unit]);
    };

    const removeUnit = (unit) => {
        setUnits(units.filter(u => u !== unit));
    };

    // Ingredient Actions
    const addIngredient = (ingredient) => {
        // Check if updating existing by ID or adding new
        if (ingredient.id) {
            setIngredients(ingredients.map(i => i.id === ingredient.id ? ingredient : i));
            logAction('Обновление', `Обновлен материал: ${ingredient.name}`);
        } else {
            setIngredients([...ingredients, { ...ingredient, id: generateId() }]);
            logAction('Создание', `Добавлен материал: ${ingredient.name} (${ingredient.quantity} ${ingredient.unit})`);
        }
    };

    const removeIngredient = (id) => {
        const name = ingredients.find(i => i.id === id)?.name;
        setIngredients(ingredients.filter(i => i.id !== id));
        logAction('Удаление', `Удален материал: ${name}`);
    };

    // Product Actions
    const addProduct = (product) => {
        if (product.id) {
            setProducts(products.map(p => p.id === product.id ? product : p));
        } else {
            setProducts([...products, { ...product, id: generateId() }]);
            logAction('Создание', `Создан продукт: ${product.name}`);
        }
    };

    const removeProduct = (id) => {
        const name = products.find(p => p.id === id)?.name;
        setProducts(products.filter(p => p.id !== id));
        logAction('Удаление', `Удален продукт: ${name}`);
    };

    // PRODUCTION LOGIC
    const produceProduct = (productId, quantity) => {
        const product = products.find(p => p.id === productId);
        if (!product) return { success: false, error: 'Продукт не найден' };

        // Check ingredients
        const missing = [];
        product.recipe.forEach(item => {
            const requiredAmount = item.amount * quantity;
            const stockIngredient = ingredients.find(i => i.id === item.ingredientId);
            if (!stockIngredient || stockIngredient.quantity < requiredAmount) {
                missing.push(stockIngredient ? stockIngredient.name : 'Неизвестный материал');
            }
        });

        if (missing.length > 0) {
            return { success: false, error: `Не хватает материалов: ${missing.join(', ')}` };
        }

        // Deduct stock
        const newIngredients = ingredients.map(ing => {
            const recipeItem = product.recipe.find(r => r.ingredientId === ing.id);
            if (recipeItem) {
                return { ...ing, quantity: ing.quantity - (recipeItem.amount * quantity) };
            }
            return ing;
        });

        setIngredients(newIngredients);
        logAction('Производство', `Произведено ${quantity} ${product.unit} "${product.name}"`);
        return { success: true };
    };

    const value = {
        units, addUnit, removeUnit,
        ingredients, addIngredient, removeIngredient,
        products, addProduct, removeProduct,
        history, logAction,
        produceProduct
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within StoreProvider');
    return context;
};
