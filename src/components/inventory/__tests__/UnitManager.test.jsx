import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import UnitManager from '../UnitManager';
import { LangProvider } from '../../../i18n';
import { useInventoryStore } from '../../../store/inventoryStore';

// Mock useInventoryStore
vi.mock('../../../store/inventoryStore', () => ({
    useInventoryStore: vi.fn(),
}));

const mockAddUnit = vi.fn();
const mockRemoveUnit = vi.fn();
const mockAddToast = vi.fn();

describe('UnitManager', () => {
    beforeEach(() => {
        useInventoryStore.mockReturnValue({
            units: ['kg', 'g', 'pcs'],
            addUnit: mockAddUnit,
            removeUnit: mockRemoveUnit,
            addToast: mockAddToast,
        });
        vi.clearAllMocks();
    });

    const renderComponent = () =>
        render(
            <LangProvider>
                <UnitManager />
            </LangProvider>
        );

    it('renders the list of units', () => {
        renderComponent();
        expect(screen.getByText('kg')).toBeInTheDocument();
        expect(screen.getByText('g')).toBeInTheDocument();
        expect(screen.getByText('pcs')).toBeInTheDocument();
    });

    it('disables add button if input is empty', () => {
        renderComponent();
        const input = screen.getByPlaceholderText(/Например/i);
        const submitButton = screen.getByRole('button', { name: /Добавить/i });

        fireEvent.change(input, { target: { value: ' ' } });
        expect(submitButton).toBeDisabled();
    });

    it('shows error if unit already exists', () => {
        renderComponent();
        const input = screen.getByPlaceholderText(/Например/i);
        const submitButton = screen.getByRole('button', { name: /Добавить/i });

        fireEvent.change(input, { target: { value: 'kg' } }); // 'kg' is in our initial mock
        fireEvent.click(submitButton);

        expect(screen.getByText(/уже существует/i)).toBeInTheDocument();
        expect(mockAddUnit).not.toHaveBeenCalled();
    });

    it('calls addUnit when form is submitted with valid data', () => {
        renderComponent();
        const input = screen.getByPlaceholderText(/Например/i);
        const submitButton = screen.getByRole('button', { name: /Добавить/i });

        fireEvent.change(input, { target: { value: 'ml' } });
        fireEvent.click(submitButton);

        expect(mockAddUnit).toHaveBeenCalledWith('ml');
        expect(mockAddToast).toHaveBeenCalled();
    });

    it('calls removeUnit when delete icon is clicked', () => {
        renderComponent();
        // The delete buttons have aria-label "Удалить {unit}"
        const deleteButtons = screen.getAllByLabelText(/Удалить/i);
        fireEvent.click(deleteButtons[0]); // delete 'kg'

        expect(mockRemoveUnit).toHaveBeenCalledWith('kg');
        expect(mockAddToast).toHaveBeenCalled();
    });

    it('shows empty state when no units are available', () => {
        useInventoryStore.mockReturnValue({
            units: [],
            addUnit: mockAddUnit,
            removeUnit: mockRemoveUnit,
            addToast: mockAddToast,
        });

        renderComponent();
        expect(screen.getByText(/Список пуст/i)).toBeInTheDocument();
    });
});
