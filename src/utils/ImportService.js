import * as XLSX from 'xlsx';

/**
 * Universal service for importing data from Excel (.xlsx)
 */
export const ImportService = {
    /**
     * Read an Excel file and convert it to an array of objects
     * @param {File} file - The file to read
     * @returns {Promise<Array>} - Parsed data
     */
    parseFile: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    resolve(json);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Map raw JSON data to Ingredient objects based on translations
     * @param {Array} rawData - Array from sheet_to_json
     * @param {Object} t - Translation object (from useLang)
     * @returns {Array} - Mapped and validated objects
     */
    mapToIngredients: (rawData, t) => {
        // Build reverse mapping (Localized Title -> Internal Key)
        const mapping = {
            [t.ingredients.name]: 'name',
            [t.ingredients.quantity]: 'quantity',
            [t.ingredients.unit]: 'unit',
            [t.ingredients.minStock]: 'minStock'
        };

        // Also add fallbacks for other languages just in case
        const fallbacks = {
            'Название': 'name',
            'Кількість': 'quantity',
            'Количество': 'quantity',
            'Единица': 'unit',
            'Одиниця': 'unit',
            'Мин. остаток': 'minStock',
            'Мін. залишок': 'minStock',
            'Min Stock': 'minStock',
            'Name': 'name',
            'Quantity': 'quantity',
            'Unit': 'unit'
        };

        const finalMapping = { ...fallbacks, ...mapping };

        return rawData.map(row => {
            const ingredient = {};

            // Map keys
            Object.keys(row).forEach(key => {
                const internalKey = finalMapping[key.trim()];
                if (internalKey) {
                    ingredient[internalKey] = row[key];
                }
            });

            // Validation & Normalization
            if (ingredient.name) {
                return {
                    name: ingredient.name.toString().trim(),
                    quantity: parseFloat(ingredient.quantity) || 0,
                    unit: (ingredient.unit || 'шт').toString().trim(),
                    minStock: parseFloat(ingredient.minStock) || 0
                };
            }
            return null;
        }).filter(Boolean); // Remove empty rows or rows without name
    }
};
