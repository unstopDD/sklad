/**
 * Logic for filtering low stock items on the dashboard
 */
export const StockFilter = {
    /**
     * Filters ingredients that are below minStock and have been active
     */
    getLowIngredients: (ingredients, activeItemNames) => {
        return [...ingredients]
            .filter(i => {
                const quantity = Number(i.quantity) || 0;
                const minStock = Number(i.minStock !== undefined ? i.minStock : i.min_stock) || 0;

                const isLow = quantity <= minStock;

                // Item is active if its name appears in recent history descriptions
                const isActive = Array.from(activeItemNames).some(historyText =>
                    historyText.includes(i.name)
                );

                return isLow && (isActive || quantity === 0);
            })
            .sort((a, b) => Number(a.quantity) - Number(b.quantity))
            .slice(0, 5);
    },

    /**
     * Filters products that are out of stock and have been active
     */
    getLowProducts: (products, activeItemNames) => {
        return [...products]
            .filter(p => {
                const quantity = Number(p.quantity) || 0;
                const isLow = quantity <= 0;

                const isActive = Array.from(activeItemNames).some(historyText =>
                    historyText.includes(p.name)
                );

                return isLow && isActive;
            })
            .sort((a, b) => (Number(a.quantity) || 0) - (Number(b.quantity) || 0))
            .slice(0, 5);
    },

    /**
     * Extracts unique item names referenced in recent history
     */
    getActiveItemNames: (history, days = 30) => {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - days);

        return new Set(
            history
                .filter(h => new Date(h.date) >= threshold)
                .map(h => {
                    const match = h.description.match(/"([^"]+)"/);
                    return match ? match[1] : h.description;
                })
        );
    }
};
