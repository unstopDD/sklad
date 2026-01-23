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
    exportToExcel: (data, { filename = 'export', sheetName = 'Sheet1', headers = null, format = 'xlsx' }) => {
        try {
            // 1. Create worksheet
            let ws;
            let finalData;

            if (headers) {
                // If custom headers provided, map data to match headers
                finalData = data.map(item => {
                    const mappedItem = {};
                    Object.keys(headers).forEach(key => {
                        mappedItem[headers[key]] = item[key];
                    });
                    return mappedItem;
                });
                ws = XLSX.utils.json_to_sheet(finalData);
            } else {
                finalData = data;
                ws = XLSX.utils.json_to_sheet(finalData);
            }

            // 2. Set Column Widths (Auto-fit only for original Excel)
            if (format === 'xlsx') {
                const colWidths = Object.keys(finalData[0] || {}).map(key => {
                    const maxLen = Math.max(
                        key.toString().length,
                        ...finalData.map(row => (row[key] || '').toString().length)
                    );
                    return { wch: maxLen + 2 };
                });
                ws['!cols'] = colWidths;
            }

            // 3. Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // 4. Write file and trigger download
            const bookType = format === 'csv' ? 'csv' : 'xlsx';
            const fileNameWithExt = `${filename}_${new Date().toISOString().split('T')[0]}.${format}`;

            XLSX.writeFile(wb, fileNameWithExt, { bookType });

            return true;
        } catch (error) {
            console.error('[ExportService] Export failed:', error);
            return false;
        }
    },

    /**
     * Specialized export for Ingredients
     */
    exportIngredients: (ingredients, t, format = 'xlsx') => {
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
            headers,
            format
        });
    },

    /**
     * Specialized export for Products
     */
    exportProducts: (products, t, ingredients, format = 'xlsx') => {
        const headers = {
            name: t.products.name,
            quantity: t.products.quantity,
            unit: t.common.unitLabel || t.ingredients.unit,
            recipe: t.products.composition || 'Состав'
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
            headers,
            format
        });
    },

    /**
     * Specialized export for History
     */
    exportHistory: (history, t, format = 'xlsx') => {
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
            headers,
            format
        });
    }
};
