-- ======================================================
-- ДИАГНОСТИКА RLS и ДАННЫХ
-- Запустите этот скрипт в SQL Editor и посмотрите результаты
-- ======================================================

-- 1. Проверяем, включен ли RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Проверяем политики
SELECT * FROM pg_policies;

-- 3. Смотрим распределение данных по пользователям
-- Если тут есть NULL или лишние ID, значит данные "общие"
SELECT 'ingredients' as table_name, user_id, COUNT(*) as count FROM ingredients GROUP BY user_id
UNION ALL
SELECT 'products', user_id, COUNT(*) FROM products GROUP BY user_id;

-- 4. Проверяем текущего пользователя (будет работать только если вызывать из App, но тут полезно для структуры)
-- SELECT auth.uid();
