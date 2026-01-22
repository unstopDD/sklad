import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useInventoryStore } from '../inventoryStore';
import { supabase } from '../../lib/supabase';

// Mock supabase with stable objects for chaining
const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
};

vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => mockQueryBuilder),
        auth: {
            signOut: vi.fn(),
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
        }
    }
}));

describe('inventoryStore', () => {
    beforeEach(() => {
        // Reset store before each test
        const store = useInventoryStore.getState();
        useInventoryStore.setState({
            units: [],
            ingredients: [],
            products: [],
            history: [],
            toasts: [],
            user: { id: 'test-user' }
        });
        vi.clearAllMocks();
    });

    it('should add a toast and remove it after 3 seconds', async () => {
        vi.useFakeTimers();
        const { addToast } = useInventoryStore.getState();

        addToast('Test Message', 'success');

        let state = useInventoryStore.getState();
        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0].message).toBe('Test Message');

        vi.advanceTimersByTime(3000);
        state = useInventoryStore.getState();
        expect(state.toasts).toHaveLength(0);
        vi.useRealTimers();
    });

    it('should toggle dark mode', () => {
        const { toggleDarkMode } = useInventoryStore.getState();

        // Initial state might depend on localStorage, let's force it
        useInventoryStore.setState({ darkMode: false });

        toggleDarkMode();
        expect(useInventoryStore.getState().darkMode).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(true);

        toggleDarkMode();
        expect(useInventoryStore.getState().darkMode).toBe(false);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should add a unit optimistically and revert on error', async () => {
        const mockError = { error: { message: 'Failed' } };
        mockQueryBuilder.insert.mockResolvedValueOnce(mockError);

        const { addUnit } = useInventoryStore.getState();
        await addUnit('kg');

        // It should have been added and then removed due to error
        expect(useInventoryStore.getState().units).not.toContain('kg');
        expect(useInventoryStore.getState().toasts).toHaveLength(1);
    });

    it('should add an ingredient successfully', async () => {
        const newIng = { id: 1, name: 'Sugar', quantity: 10, unit: 'kg', min_stock: 5 };
        mockQueryBuilder.single.mockResolvedValueOnce({ data: newIng, error: null });

        const { addIngredient } = useInventoryStore.getState();
        const result = await addIngredient({ name: 'Sugar', quantity: 10, unit: 'kg', minStock: 5 });

        expect(result.success).toBe(true);
        expect(useInventoryStore.getState().ingredients).toHaveLength(1);
        expect(useInventoryStore.getState().ingredients[0].name).toBe('Sugar');
    });

    it('should deduct ingredients when producing a product', async () => {
        const ingredient = { id: 'ing1', name: 'Flour', quantity: 100, unit: 'g' };
        const product = {
            id: 'prod1',
            name: 'Bread',
            quantity: 0,
            unit: 'pcs',
            recipe: [{ ingredientId: 'ing1', amount: 50 }]
        };

        useInventoryStore.setState({
            ingredients: [ingredient],
            products: [product]
        });

        mockQueryBuilder.eq.mockResolvedValue({ error: null });

        const { produceProduct } = useInventoryStore.getState();
        const result = await produceProduct('prod1', 1);

        expect(result.success).toBe(true);
        const state = useInventoryStore.getState();
        expect(state.ingredients[0].quantity).toBe(50);
        expect(state.products[0].quantity).toBe(1);
    });

    it('should fail production if not enough ingredients', async () => {
        const ingredient = { id: 'ing1', name: 'Flour', quantity: 10, unit: 'g' };
        const product = {
            id: 'prod1',
            name: 'Bread',
            quantity: 0,
            recipe: [{ ingredientId: 'ing1', amount: 50 }]
        };

        useInventoryStore.setState({
            ingredients: [ingredient],
            products: [product]
        });

        const { produceProduct } = useInventoryStore.getState();
        const result = await produceProduct('prod1', 1);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Не хватает');
    });
});
