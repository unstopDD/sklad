-- Row Level Security (RLS) Setup for SKLAD
-- This ensures each user sees only their own data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for units table
CREATE POLICY "Users can view own units"
  ON units FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own units"
  ON units FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own units"
  ON units FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own units"
  ON units FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for ingredients table
CREATE POLICY "Users can view own ingredients"
  ON ingredients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredients"
  ON ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ingredients"
  ON ingredients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingredients"
  ON ingredients FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for products table
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for history table
CREATE POLICY "Users can view own history"
  ON history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"  
  ON history FOR DELETE
  USING (auth.uid() = user_id);
