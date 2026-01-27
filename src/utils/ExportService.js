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
    exportToExcel: (data, { filename = 'export', sheetName = 'Sheet1', headers = null, format = 'xlsx', productionName = '' }) => {
        try {
            // 1. Prepare data
            let finalData;
            if (headers) {
                finalData = data.map(item => {
                    const mappedItem = {};
                    Object.keys(headers).forEach(key => {
                        mappedItem[headers[key]] = item[key];
                    });
                    return mappedItem;
                });
            } else {
                finalData = data;
            }

            // 2. Create worksheet
            const ws = XLSX.utils.json_to_sheet(finalData);

            // 3. Set Styling and Metadata (XLSX only)
            if (format === 'xlsx') {
                // Auto-fit column widths with extra space
                const colWidths = Object.keys(finalData[0] || {}).map(key => {
                    const maxLen = Math.max(
                        key.toString().length,
                        ...finalData.map(row => (row[key]?.toString() || '').length)
                    );
                    return { wch: Math.min(maxLen + 5, 50) };
                });
                ws['!cols'] = colWidths;

                // Add Auto-filters
                const range = XLSX.utils.decode_range(ws['!ref']);
                ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

                // Freeze Top Row
                ws['!views'] = [{ state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2', activePane: 'bottomLeft' }];
            }

            // 4. Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // 5. Write file
            const dateStr = new Date().toISOString().split('T')[0];
            const fileNameWithExt = `${filename}_${dateStr}.${format}`;

            if (format === 'csv') {
                // For CSV, add UTF-8 BOM so Excel opens it correctly in columns
                const csvContent = XLSX.utils.sheet_to_csv(ws, { FS: ';' });
                const bom = '\uFEFF';
                const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileNameWithExt;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                XLSX.writeFile(wb, fileNameWithExt, { bookType: 'xlsx' });
            }

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
        if (format === '1c') {
            const headers = {
                id: 'Код',
                name: 'Наименование',
                quantity: 'Количество',
                unit: 'Ед.Изм.'
            };
            const data = ingredients.map(i => ({
                id: i.id.substring(0, 8), // Short ID for 1C
                name: i.name,
                quantity: i.quantity,
                unit: i.unit
            }));
            return ExportService.exportToExcel(data, {
                filename: `1C_Materials`,
                sheetName: '1C',
                headers,
                format: 'csv',
                productionName: t.profile?.production_name
            });
        }

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
            format,
            productionName: t.profile?.production_name
        });
    },

    /**
     * Specialized export for Products
     */
    exportProducts: (products, t, ingredients, format = 'xlsx') => {
        if (format === '1c') {
            const headers = {
                id: 'Код',
                name: 'Наименование',
                quantity: 'Количество',
                unit: 'Ед.Изм.'
            };
            const data = products.map(p => ({
                id: p.id.substring(0, 8),
                name: p.name,
                quantity: p.quantity,
                unit: p.unit
            }));
            return ExportService.exportToExcel(data, {
                filename: `1C_Products`,
                sheetName: '1C',
                headers,
                format: 'csv',
                productionName: t.profile?.production_name
            });
        }

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
            format,
            productionName: t.profile?.production_name
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
            format,
            productionName: t.profile?.production_name
        });
    },

    /**
     * Download empty template for import
     */
    downloadTemplate: (type, t) => {
        let headers = {};
        let filename = '';
        if (type === 'materials') {
            headers = {
                name: t.ingredients.name,
                quantity: t.ingredients.quantity,
                unit: t.ingredients.unit,
                minStock: t.ingredients.minStock
            };
            filename = 'Template_Materials';
        } else {
            headers = {
                name: t.products.name,
                quantity: t.products.quantity,
                unit: t.common.unitLabel || t.ingredients.unit,
                recipe: t.products.composition || 'Состав'
            };
            filename = 'Template_Products';
        }

        // Sample row with real-looking data
        const data = [];
        if (type === 'materials') {
            data.push({
                [headers.name]: t.ingredients.sampleName,
                [headers.quantity]: 100,
                [headers.unit]: t.ingredients.sampleUnit,
                [headers.minStock]: 10
            });
        } else {
            data.push({
                [headers.name]: t.products.sampleName,
                [headers.quantity]: 50,
                [headers.unit]: t.products.sampleUnit,
                [headers.recipe]: t.products.sampleRecipe
            });
        }

        return ExportService.exportToExcel(data, {
            filename,
            sheetName: 'Template',
            headers: null, // Data is already mapped
            format
        });
    }
};
