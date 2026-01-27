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
                    let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Header 1 means raw arrays

                    // 1C Support: Find the actual header row
                    // Usually 1C files have garbage at the top
                    const { headerIndex, delimiter } = ImportService.detectHeader(jsonData);

                    if (headerIndex === -1) {
                        // Fallback to old behavior if no clear header found
                        resolve(XLSX.utils.sheet_to_json(worksheet));
                        return;
                    }

                    // If columns are stuck in a single cell (e.g. CSV with ;)
                    if (delimiter) {
                        jsonData = jsonData.map(row => {
                            if (row.length === 1 && typeof row[0] === 'string' && row[0].includes(delimiter)) {
                                return row[0].split(delimiter);
                            }
                            return row;
                        });
                    }

                    // Extract data from found header
                    const headers = jsonData[headerIndex];
                    const rows = jsonData.slice(headerIndex + 1);

                    const mappedData = rows.map(row => {
                        const obj = {};
                        headers.forEach((h, i) => {
                            if (h) obj[h] = row[i];
                        });
                        return obj;
                    }).filter(obj => Object.values(obj).some(v => v !== null && v !== undefined && v !== ''));

                    resolve(mappedData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Smart Header Detection
     * Looks for rows containing keywords like "Наименование", "Кол-во", etc.
     */
    detectHeader: (rows) => {
        const keywords = ['наименование', 'назва', 'name', 'количество', 'кількість', 'quantity', 'код', 'артикул', 'art', 'code', 'ед.изм', 'од.вим', 'единица'];

        for (let i = 0; i < Math.min(rows.length, 20); i++) {
            let row = rows[i];
            if (!Array.isArray(row)) continue;

            // Handle non-split CSV (e.g. semicolon)
            let cells = row;
            let detectedDelimiter = null;
            if (row.length === 1 && typeof row[0] === 'string') {
                if (row[0].includes(';')) {
                    cells = row[0].split(';');
                    detectedDelimiter = ';';
                } else if (row[0].includes(',')) {
                    cells = row[0].split(',');
                    detectedDelimiter = ',';
                }
            }

            const matchCount = cells.filter(cell =>
                cell && keywords.some(k => cell.toString().toLowerCase().includes(k))
            ).length;

            if (matchCount >= 2) {
                return { headerIndex: i, delimiter: detectedDelimiter };
            }
        }
        return { headerIndex: -1, delimiter: null };
    },

    /**
     * Detect if the file looks like materials or products
     * @param {Array} rawData - Data from parseFile (mapped objects)
     * @returns {string} - 'materials' | 'products' | 'unknown'
     */
    detectFileType: (rawData) => {
        if (!rawData || rawData.length === 0) return 'unknown';

        // Take first few items to check keys
        const firstItem = rawData[0];
        const keys = Object.keys(firstItem).map(k => k.toLowerCase().trim());

        // Keywords for Products
        const productKeywords = ['состав', 'рецепт', 'composition', 'recipe'];

        // Keywords for Materials (unlikely to be in Products)
        const materialKeywords = [
            'мин. остаток', 'мін. залишок', 'min stock', 'min_stock',
            'цена за', 'ціна за', 'price per', 'cost per',
            'артикул', 'external code', 'external_code'
        ];

        const hasProductKey = keys.some(k => productKeywords.some(pk => k.includes(pk)));
        const hasMaterialKey = keys.some(k => materialKeywords.some(mk => k.includes(mk)));

        if (hasProductKey) return 'products';
        if (hasMaterialKey) return 'materials';

        return 'unknown';
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
            'Наименование': 'name',
            'Назва': 'name',
            'Name': 'name',
            'Кількість': 'quantity',
            'Количество': 'quantity',
            'Кол-во': 'quantity',
            'Quantity': 'quantity',
            'Единица': 'unit',
            'Одиниця': 'unit',
            'Ед.изм.': 'unit',
            'Ед. изм.': 'unit',
            'Ед.Изм.': 'unit',
            'Unit': 'unit',
            'Мин. остаток': 'minStock',
            'Мін. залишок': 'minStock',
            'Min Stock': 'minStock',
            'Код': 'external_code',
            'Артикул': 'external_code',
            'Code': 'external_code',
            'External Code': 'external_code'
        };

        const finalMapping = { ...fallbacks, ...mapping };

        return rawData.map(row => {
            const ingredient = {};

            // Map keys (with normalization to remove BOM/hidden chars)
            Object.keys(row).forEach(key => {
                const normalizedKey = key.toString().replace(/[^\x20-\x7E\u0400-\u04FF]/g, '').trim();
                const internalKey = finalMapping[normalizedKey] || finalMapping[key.trim()];

                if (internalKey) {
                    ingredient[internalKey] = row[key];
                }
            });

            // Validation & Normalization
            if (ingredient.name) {
                // Unit normalization for 1C: "кг (Килограмм)" -> "кг"
                let unit = (ingredient.unit || 'кг').toString().trim();
                if (unit.includes('(')) unit = unit.split('(')[0].trim();
                if (unit.toLowerCase().startsWith('шт')) unit = 'шт';

                return {
                    name: ingredient.name.toString().trim(),
                    quantity: parseFloat(ingredient.quantity) || 0,
                    unit: unit,
                    minStock: parseFloat(ingredient.minStock) || 0,
                    external_code: ingredient.external_code ? ingredient.external_code.toString().trim() : null
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
            'Наименование': 'name',
            'Назва': 'name',
            'Name': 'name',
            'Количество': 'quantity',
            'Кількість': 'quantity',
            'Quantity': 'quantity',
            'Единица': 'unit',
            'Одиниця': 'unit',
            'Ед.изм.': 'unit',
            'Ед.Изм.': 'unit',
            'Unit': 'unit',
            'Состав': 'recipeRaw',
            'Рецепт': 'recipeRaw',
            'Recipe': 'recipeRaw',
            'Composition': 'recipeRaw',
            'Код': 'external_code',
            'Артикул': 'external_code',
            'Code': 'external_code'
        };

        const finalMapping = { ...fallbacks, ...mapping };

        return rawData.map(row => {
            const product = {};
            Object.keys(row).forEach(key => {
                const normalizedKey = key.toString().replace(/[^\x20-\x7E\u0400-\u04FF]/g, '').trim();
                const internalKey = finalMapping[normalizedKey] || finalMapping[key.trim()];
                if (internalKey) product[internalKey] = row[key];
            });

            if (!product.name) return null;

            // Parse Recipe: "Ингредиент: Кол-во, Ингредиент2: Кол-во"
            const recipe = [];
            const warnings = [];

            if (product.recipeRaw && product.recipeRaw.toString().trim()) {
                const parts = product.recipeRaw.toString().split(',');
                parts.forEach(part => {
                    if (!part.includes(':')) return;
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
                external_code: product.external_code ? product.external_code.toString().trim() : null,
                warnings: warnings.length > 0 ? warnings : null
            };
        }).filter(Boolean);
    }
};
