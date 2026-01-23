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
                    unit: (ingredient.unit || 'кг').toString().trim(),
                    minStock: parseFloat(ingredient.minStock) || 0
                };
            }
            return null;
        }).filter(Boolean); // Remove empty rows or rows without name
    },

    /**
     * Map raw JSON data to Product objects
     * @param {Array} rawData 
     * @param {Object} t 
     * @param {Array} allIngredients - Current ingredients to match names
     */
    mapToProducts: (rawData, t, allIngredients) => {
        const mapping = {
            [t.products.name]: 'name',
            [t.products.quantity]: 'quantity',
            [t.common.unitLabel || t.ingredients.unit]: 'unit',
            [t.products.composition || 'Состав']: 'recipeRaw'
        };

        const fallbacks = {
            'Название': 'name',
            'Количество': 'quantity',
            'Единица': 'unit',
            'Состав': 'recipeRaw',
            'Рецепт': 'recipeRaw',
            'Name': 'name',
            'Quantity': 'quantity',
            'Unit': 'unit',
            'Recipe': 'recipeRaw',
            'Composition': 'recipeRaw'
        };

        const finalMapping = { ...fallbacks, ...mapping };

        return rawData.map(row => {
            const product = {};
            Object.keys(row).forEach(key => {
                const internalKey = finalMapping[key.trim()];
                if (internalKey) product[internalKey] = row[key];
            });

            if (!product.name) return null;

            // Parse Recipe: "Ингредиент: Кол-во, Ингредиент2: Кол-во"
            const recipe = [];
            const warnings = [];

            if (product.recipeRaw) {
                const parts = product.recipeRaw.toString().split(',');
                parts.forEach(part => {
                    const [ingName, qtyStr] = part.split(':').map(s => s.trim());
                    if (ingName && qtyStr) {
                        const ingredient = allIngredients.find(i =>
                            i.name.toLowerCase() === ingName.toLowerCase()
                        );

                        if (ingredient) {
                            recipe.push({
                                ingredientId: ingredient.id,
                                amount: parseFloat(qtyStr) || 0
                            });
                        } else {
                            // Save original name for auto-creation later
                            recipe.push({
                                ingName: ingName,
                                amount: parseFloat(qtyStr) || 0
                            });
                            warnings.push(`Будет создан новый материал: ${ingName}`);
                        }
                    }
                });
            }

            return {
                name: product.name.toString().trim(),
                quantity: parseFloat(product.quantity) || 0,
                unit: (product.unit || 'шт').toString().trim(),
                recipe,
                warnings: warnings.length > 0 ? warnings : null
            };
        }).filter(Boolean);
    }
};
