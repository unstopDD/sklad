-- ======================================================
-- ОПТИМИЗАЦИЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- Добавление индексов для ускорения RLS (Row Level Security)
-- ======================================================

-- RLS проверяет auth.uid() = user_id в каждой строке.
-- Без индексов база данных вынуждена сканировать всю таблицу (Full Scan).
-- Индексы позволяют находить данные пользователя мгновенно.

CREATE INDEX IF NOT EXISTS idx_units_user_id ON units(user_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_user_id ON ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);

-- Для таблицы profiles индекс обычно есть автоматически (если id это Primary Key),
-- но для гарантии проверим и его (хотя Primary Key индексируется сам).
-- CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
