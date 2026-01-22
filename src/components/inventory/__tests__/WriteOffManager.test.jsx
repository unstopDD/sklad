import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import WriteOffManager from '../WriteOffManager';
import { LangProvider } from '../../../i18n';
import { useInventoryStore } from '../../../store/inventoryStore';

// Mock useInventoryStore
vi.mock('../../../store/inventoryStore', () => ({
    useInventoryStore: vi.fn(),
}));

const mockAddToast = vi.fn();
const mockLogAction = vi.fn();
const mockUpdateIngredientQuantity = vi.fn();
const mockUpdateProductQuantity = vi.fn();

const mockIngredients = [
    { id: 'ing1', name: 'Sugar', quantity: 10, unit: 'kg' },
];

const mockProducts = [
    { id: 'prod1', name: 'Cake', quantity: 5, unit: 'pcs' },
];

describe('WriteOffManager', () => {
    beforeEach(() => {
        useInventoryStore.mockReturnValue({
            ingredients: mockIngredients,
            products: mockProducts,
            addToast: mockAddToast,
            logAction: mockLogAction,
            updateIngredientQuantity: mockUpdateIngredientQuantity,
            updateProductQuantity: mockUpdateProductQuantity,
        });
        vi.clearAllMocks();
    });

    const renderComponent = () =>
        render(
            <LangProvider>
                <WriteOffManager />
            </LangProvider>
        );

    it('renders initial state with materials selected', () => {
        renderComponent();
        expect(screen.getByText(/Списание/i)).toBeInTheDocument();
        // The select placeholder text
        expect(screen.getByText(/Выберите\.\.\./i)).toBeInTheDocument();
    });

    it('switches between materials and products', () => {
        renderComponent();
        const productBtn = screen.getByText(/Продукты/i);
        fireEvent.click(productBtn);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'prod1' } });
        expect(screen.getByText(/Доступно: 5 pcs/i)).toBeInTheDocument();
    });

    it('shows warning when quantity exceeds stock', () => {
        renderComponent();
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'ing1' } });

        const qtyInput = screen.getByRole('spinbutton');
        fireEvent.change(qtyInput, { target: { value: '15' } });

        expect(screen.getByText(/превышает остаток/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Списать/i })).toBeDisabled();
    });

    it('calls updateIngredientQuantity when writing off material', async () => {
        renderComponent();
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'ing1' } });

        const qtyInput = screen.getByRole('spinbutton');
        fireEvent.change(qtyInput, { target: { value: '2' } });

        const reasonInput = screen.getByPlaceholderText(/Просрочка/i);
        fireEvent.change(reasonInput, { target: { value: 'Expired' } });

        const submitBtn = screen.getByRole('button', { name: /Списать/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockUpdateIngredientQuantity).toHaveBeenCalledWith('ing1', 8);
            expect(mockLogAction).toHaveBeenCalled();
            expect(mockAddToast).toHaveBeenCalled();
        });
    });

    it('calls updateProductQuantity when writing off product', async () => {
        renderComponent();
        const productBtn = screen.getByText(/Продукты/i);
        fireEvent.click(productBtn);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'prod1' } });

        const qtyInput = screen.getByRole('spinbutton');
        fireEvent.change(qtyInput, { target: { value: '1' } });

        const submitBtn = screen.getByRole('button', { name: /Списать/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockUpdateProductQuantity).toHaveBeenCalledWith('prod1', 4);
            expect(mockLogAction).toHaveBeenCalled();
        });
    });
});
