import * as XLSX from 'xlsx';

/**
 * Universal service for exporting data to Excel (.xlsx)
 */
export const ExportService = {
    /**
     * Export raw data to Excel
     * @param {Array} data - Array of objects to export
     * @param {Object} options - Export options (filename, sheetName, headers)
     */
    exportToExcel: (data, { filename = 'export', sheetName = 'Sheet1', headers = null }) => {
        try {
            // 1. Create worksheet
            let ws;
            if (headers) {
                // If custom headers provided, map data to match headers
                const mappedData = data.map(item => {
                    const mappedItem = {};
                    Object.keys(headers).forEach(key => {
                        mappedItem[headers[key]] = item[key];
                    });
                    return mappedItem;
                });
                ws = XLSX.utils.json_to_sheet(mappedData);
            } else {
                ws = XLSX.utils.json_to_sheet(data);
            }

            // 2. Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // 3. Write file and trigger download
            XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);

            return true;
        } catch (error) {
            console.error('[ExportService] Export failed:', error);
            return false;
        }
    },

    /**
     * Specialized export for Ingredients
     */
    exportIngredients: (ingredients, t) => {
        const headers = {
            name: t.ingredients.name,
            quantity: t.ingredients.quantity,
            unit: t.ingredients.unit,
            minStock: t.ingredients.minStock,
            status: t.common.status || 'Статус'
        };

        const data = ingredients.map(i => ({
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            minStock: i.minStock,
            status: i.quantity <= i.minStock ? (t.inventory?.lowStock || 'Мало') : (t.common?.normal || 'ОК')
        }));

        return ExportService.exportToExcel(data, {
            filename: `Materials_${t.profile?.production_name || 'Production'}`,
            sheetName: t.ingredients.title,
            headers
        });
    },

    /**
     * Specialized export for Products
     */
    exportProducts: (products, t, ingredients) => {
        const headers = {
            name: t.products.name,
            quantity: t.products.quantity,
            unit: t.common.unitLabel || t.ingredients.unit,
            recipe: t.products.recipe || 'Рецепт'
        };

        const data = products.map(p => {
            const recipeLines = p.recipe?.map(r => {
                const ingName = ingredients.find(ing => ing.id === r.ingredientId)?.name || '???';
                return `${ingName}: ${r.amount}`;
            }).join(', ') || '';

            return {
                name: p.name,
                quantity: p.quantity,
                unit: p.unit,
                recipe: recipeLines
            };
        });

        return ExportService.exportToExcel(data, {
            filename: `Products_${t.profile?.production_name || 'Production'}`,
            sheetName: t.products.title,
            headers
        });
    },

    /**
     * Specialized export for History
     */
    exportHistory: (history, t) => {
        const headers = {
            date: t.history.date || 'Дата',
            type: t.history.type || 'Тип',
            description: t.history.desc || 'Описание'
        };

        const data = history.map(h => ({
            date: new Date(h.date).toLocaleString(),
            type: h.type,
            description: h.description
        }));

        return ExportService.exportToExcel(data, {
            filename: `History_${t.profile?.production_name || 'Production'}`,
            sheetName: t.history.title,
            headers
        });
    }
};
