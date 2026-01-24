import { describe, it, expect } from 'vitest';
import { StockFilter } from '../StockFilter';

describe('StockFilter', () => {
    describe('getActiveItemNames', () => {
        it('should extract names from history within the time window', () => {
            const now = new Date();
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);

            const oldDate = new Date();
            oldDate.setDate(now.getDate() - 40);

            const history = [
                { date: yesterday.toISOString(), description: 'Вироблено: "Шкіра"' },
                { date: yesterday.toISOString(), description: 'Додано: "Клей"' },
                { date: oldDate.toISOString(), description: 'Видалено: "Нитки"' }
            ];

            const active = StockFilter.getActiveItemNames(history, 30);
            expect(active.has('Шкіра')).toBe(true);
            expect(active.has('Клей')).toBe(true);
            expect(active.has('Нитки')).toBe(false);
        });
    });

    describe('getLowIngredients', () => {
        const ingredients = [
            { id: 1, name: 'Кожа', quantity: 41.9, minStock: 5 }, // High stock
            { id: 2, name: 'Клей', quantity: 2, minStock: 5 },   // Low stock
            { id: 3, name: 'Нитки', quantity: 0, minStock: 5 },  // Zero stock
            { id: 4, name: 'Шнурки', quantity: 3, minStock: 10 } // Low stock but maybe inactive
        ];

        it('should hide high stock even if active', () => {
            const active = new Set(['Кожа']);
            const result = StockFilter.getLowIngredients(ingredients, active);
            expect(result.find(i => i.name === 'Кожа')).toBeUndefined();
        });

        it('should show low stock if active', () => {
            const active = new Set(['Клей']);
            const result = StockFilter.getLowIngredients(ingredients, active);
            expect(result.find(i => i.name === 'Клей')).toBeDefined();
        });

        it('should always show 0 stock regardless of recent activity', () => {
            const active = new Set();
            const result = StockFilter.getLowIngredients(ingredients, active);
            expect(result.find(i => i.name === 'Нитки')).toBeDefined();
        });

        it('should hide low stock if NOT active (and not zero)', () => {
            const active = new Set(['Клей']); // Sugar (Шнурки) NOT active
            const result = StockFilter.getLowIngredients(ingredients, active);
            expect(result.find(i => i.name === 'Шнурки')).toBeUndefined();
        });
    });

    describe('getLowProducts', () => {
        const products = [
            { id: 1, name: 'Сумка', quantity: 0 },
            { id: 2, name: 'Черевики', quantity: 10 }
        ];

        it('should show out of stock active products', () => {
            const active = new Set(['Сумка']);
            const result = StockFilter.getLowProducts(products, active);
            expect(result.find(p => p.name === 'Сумка')).toBeDefined();
        });

        it('should hide available products even if active', () => {
            const active = new Set(['Черевики']);
            const result = StockFilter.getLowProducts(products, active);
            expect(result.find(p => p.name === 'Черевики')).toBeUndefined();
        });
    });
});
