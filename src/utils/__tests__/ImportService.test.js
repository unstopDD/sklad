import { describe, it, expect } from 'vitest';
import { ImportService } from '../ImportService';

describe('ImportService', () => {
    const t = {
        common: {
            unitLabel: 'Одиниця'
        },
        ingredients: {
            name: 'Назва',
            quantity: 'Кількість',
            unit: 'Одиниця',
            minStock: 'Мін. залишок'
        },
        products: {
            name: 'Назва продукту',
            quantity: 'В наявності',
            composition: 'Склад'
        }
    };

    describe('mapToIngredients', () => {
        it('should map correctly with localized headers', () => {
            const raw = [
                { 'Назва': 'Кожа', 'Кількість': '10', 'Одиниця': 'м2', 'Мін. залишок': '5' }
            ];
            const result = ImportService.mapToIngredients(raw, t);
            expect(result[0]).toEqual({
                name: 'Кожа',
                quantity: 10,
                unit: 'м2',
                minStock: 5
            });
        });

        it('should use fallbacks for missing translations', () => {
            const raw = [
                { 'Name': 'Nails', 'Quantity': '100', 'Unit': 'pcs', 'Min Stock': '20' }
            ];
            const result = ImportService.mapToIngredients(raw, t);
            expect(result[0].name).toBe('Nails');
            expect(result[0].minStock).toBe(20);
        });

        it('should handle string quantities gracefully', () => {
            const raw = [{ 'Назва': 'Test', 'Кількість': 'abc' }];
            const result = ImportService.mapToIngredients(raw, t);
            expect(result[0].quantity).toBe(0);
        });
    });

    describe('mapToProducts', () => {
        const allIngredients = [
            { id: 'ing1', name: 'Кожа' },
            { id: 'ing2', name: 'Клей' }
        ];

        it('should parse complex recipes', () => {
            const raw = [
                { 'Назва продукту': 'Сумка', 'В наявності': '2', 'Склад': 'Кожа: 1.5, Клей: 0.2' }
            ];
            const result = ImportService.mapToProducts(raw, t, allIngredients);
            expect(result[0].name).toBe('Сумка');
            expect(result[0].recipe).toHaveLength(2);
            expect(result[0].recipe[0]).toEqual({ ingredientId: 'ing1', amount: 1.5 });
        });

        it('should generate warnings for missing ingredients', () => {
            const raw = [
                { 'Назва продукту': 'Сумка', 'Склад': 'Невідоме: 1' }
            ];
            const result = ImportService.mapToProducts(raw, t, allIngredients);
            expect(result[0].warnings).toBeDefined();
            expect(result[0].warnings[0]).toContain('Невідоме');
        });
    });
});
