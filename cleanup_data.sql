-- ======================================================
-- ОЧИСТКА ДАННЫХ С НЕПРАВИЛЬНЫМ USER_ID
-- Выполните после включения RLS
-- ======================================================

-- Посмотреть какие данные с каким user_id
SELECT 'units' as table_name, id, name, user_id FROM units
UNION ALL
SELECT 'ingredients', id::text, name, user_id::text FROM ingredients
UNION ALL  
SELECT 'products', id::text, name, user_id::text FROM products;

-- ВАРИАНТ 1: Удалить все данные (чистый старт)
-- Раскомментируй если хочешь начать с нуля:
-- DELETE FROM history;
-- DELETE FROM ingredients;
-- DELETE FROM products;
-- DELETE FROM units;

-- ВАРИАНТ 2: Удалить только данные без user_id
-- DELETE FROM units WHERE user_id IS NULL;
-- DELETE FROM ingredients WHERE user_id IS NULL;
-- DELETE FROM products WHERE user_id IS NULL;
-- DELETE FROM history WHERE user_id IS NULL;

-- ВАРИАНТ 3: Присвоить существующие данные конкретному пользователю
-- Замени 'YOUR-USER-ID-HERE' на реальный id из таблицы profiles
-- UPDATE units SET user_id = 'YOUR-USER-ID-HERE' WHERE user_id IS NULL OR user_id != 'YOUR-USER-ID-HERE';
-- UPDATE ingredients SET user_id = 'YOUR-USER-ID-HERE' WHERE user_id IS NULL OR user_id != 'YOUR-USER-ID-HERE';
-- UPDATE products SET user_id = 'YOUR-USER-ID-HERE' WHERE user_id IS NULL OR user_id != 'YOUR-USER-ID-HERE';
-- UPDATE history SET user_id = 'YOUR-USER-ID-HERE' WHERE user_id IS NULL OR user_id != 'YOUR-USER-ID-HERE';
