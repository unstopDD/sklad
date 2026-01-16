-- ПОЛНОЕ ОТКЛЮЧЕНИЕ RLS
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Удалить все политики
DROP POLICY IF EXISTS "Users can view own units" ON units;
DROP POLICY IF EXISTS "Users can insert own units" ON units;
DROP POLICY IF EXISTS "Users can update own units" ON units;
DROP POLICY IF EXISTS "Users can delete own units" ON units;

DROP POLICY IF EXISTS "Users can view own ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can insert own ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can update own ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can delete own ingredients" ON ingredients;

DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

DROP POLICY IF EXISTS "Users can view own history" ON history;
DROP POLICY IF EXISTS "Users can insert own history" ON history;
DROP POLICY IF EXISTS "Users can update own history" ON history;
DROP POLICY IF EXISTS "Users can delete own history" ON history;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. Отключить RLS на всех таблицах
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE history DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Проверка (должно вернуть false для всех таблиц)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('units', 'ingredients', 'products', 'history', 'profiles');
