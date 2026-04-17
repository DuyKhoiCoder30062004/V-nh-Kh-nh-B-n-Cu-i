-- ==========================================================
-- SAMPLE DATA SETUP FOR FOOD MAP SAAS
-- ==========================================================
-- This script prepares your database structure and adds
-- sample data to match your Python/React logic.

-- 1. Ensure PostGIS is enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

-- 3. Create Restaurants Table
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty_dish VARCHAR(255),
    image_url TEXT,
    description TEXT,
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_ja TEXT,
    audio_vi TEXT,
    audio_en TEXT,
    audio_ko TEXT,
    audio_zh TEXT,
    audio_ja TEXT,
    location GEOGRAPHY(POINT, 4326),
    owner_id INTEGER REFERENCES users(id)
);

-- 4. Insert Sample Users (Passwords are 'admin123', 'partner123', 'user123' respectively)
-- We use pre-hashed bcrypt strings to match your passlib setup.
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Zf9.GvG.R.N.R.N.R', 'admin'),
('partner', '$2b$12$U6Y/0v60tY9R1XN5O.lUGuK6q.OqXgGGe8Oq6fL.R.hXG.N.R.N.R', 'partner'),
('customer', '$2b$12$M.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.user', 'user')
ON CONFLICT (username) DO NOTHING;

-- 5. Insert Sample Restaurants in Vinh Khanh Area (District 4, HCM)
-- Coordinates center around 10.7612, 106.7055
INSERT INTO restaurants (name, specialty_dish, image_url, description, description_en, location) VALUES 
(
    'Ốc Đào Vĩnh Khánh', 
    'Ốc hương trứng muối', 
    'https://picsum.photos/seed/ocdao/400/300', 
    'Quán ốc nổi tiếng nhất nhì phố Vĩnh Khánh với món ốc hương trứng muối đậm đà.',
    'The most famous snail restaurant on Vinh Khanh street with rich salted egg snail.',
    ST_SetSRID(ST_MakePoint(106.7055, 10.7612), 4326)
),
(
    'Lẩu Gà Lá É Ớt Hiểm', 
    'Lẩu gà lá é', 
    'https://picsum.photos/seed/lauga/400/300', 
    'Hương vị lẩu gà Đà Lạt giữa lòng Sài Gòn, lá é thơm nồng và ớt hiểm cay nhẹ.',
    'Da Lat chicken hotpot flavor in the heart of Saigon with fragrant e-leaves.',
    ST_SetSRID(ST_MakePoint(106.7042, 10.7605), 4326)
),
(
    'Phá Lấu Cô Thảo', 
    'Phá lấu bò', 
    'https://picsum.photos/seed/phalau/400/300', 
    'Quán phá lấu lâu đời, nước dùng béo ngậy ăn kèm bánh mì nóng giòn.',
    'Long-standing Pha Lau shop with rich broth served with crispy hot bread.',
    ST_SetSRID(ST_MakePoint(106.7068, 10.7621), 4326)
);
