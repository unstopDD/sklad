-- ======================================================
-- ИСПРАВЛЕНИЕ RLS: Удаление "Public Access" политик
-- ======================================================

-- Проблема: На скриншотах видно, что есть политики "Public Access ...".
-- В Postgres, если хотя бы одна политика разрешает доступ (а Public Access разрешает всё),
-- то более строгие политики игнорируются. Нужно удалить "разрешающие всё" правила.

DROP POLICY IF EXISTS "Public Access History" ON history;
DROP POLICY IF EXISTS "Public Access Ingredients" ON ingredients;
DROP POLICY IF EXISTS "Public Access Products" ON products;
DROP POLICY IF EXISTS "Public Access Units" ON units;

-- На всякий случай проверим и удалим другие возможные вариации "открытых" политик
DROP POLICY IF EXISTS "Enable read access for all users" ON history;
DROP POLICY IF EXISTS "Enable read access for all users" ON ingredients;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON units;

-- Повторно убеждаемся, что RLS включен
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
