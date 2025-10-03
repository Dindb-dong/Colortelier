-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Color codes table
CREATE TABLE IF NOT EXISTS color_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hex_code VARCHAR(7) NOT NULL,
  rgb_r INTEGER NOT NULL,
  rgb_g INTEGER NOT NULL,
  rgb_b INTEGER NOT NULL,
  hsl_h INTEGER,
  hsl_s INTEGER,
  hsl_l INTEGER,
  name VARCHAR(100),
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Themes table
CREATE TABLE IF NOT EXISTS themes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  theme_code TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Filters table
CREATE TABLE IF NOT EXISTS filters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  before_image_url TEXT,
  after_image_url TEXT,
  xmp_file_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table (for both color codes and filters)
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  color_code_id UUID REFERENCES color_codes(id) ON DELETE CASCADE,
  filter_id UUID REFERENCES filters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure only one of color_code_id or filter_id is set
  CONSTRAINT check_like_target CHECK (
    (color_code_id IS NOT NULL AND filter_id IS NULL) OR 
    (color_code_id IS NULL AND filter_id IS NOT NULL)
  ),
  -- Ensure unique like per user per item
  CONSTRAINT unique_user_color_like UNIQUE (user_id, color_code_id),
  CONSTRAINT unique_user_filter_like UNIQUE (user_id, filter_id)
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  color_code_id UUID REFERENCES color_codes(id) ON DELETE CASCADE,
  filter_id UUID REFERENCES filters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure only one of color_code_id or filter_id is set
  CONSTRAINT check_cart_target CHECK (
    (color_code_id IS NOT NULL AND filter_id IS NULL) OR 
    (color_code_id IS NULL AND filter_id IS NOT NULL)
  ),
  -- Ensure unique item per user
  CONSTRAINT unique_user_color_cart UNIQUE (user_id, color_code_id),
  CONSTRAINT unique_user_filter_cart UNIQUE (user_id, filter_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_color_codes_hex ON color_codes(hex_code);
CREATE INDEX IF NOT EXISTS idx_color_codes_created_by ON color_codes(created_by);
CREATE INDEX IF NOT EXISTS idx_themes_created_by ON themes(created_by);
CREATE INDEX IF NOT EXISTS idx_filters_created_by ON filters(created_by);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_color_code_id ON likes(color_code_id);
CREATE INDEX IF NOT EXISTS idx_likes_filter_id ON likes(filter_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_color_codes_updated_at BEFORE UPDATE ON color_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_filters_updated_at BEFORE UPDATE ON filters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
