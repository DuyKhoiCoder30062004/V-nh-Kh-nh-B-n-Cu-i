-- ==========================================================
-- SAMPLE DATA FOR VOICEMAP SAAS (PostgreSQL)
-- ==========================================================

-- 1. Insert Sample Users
-- Passwords: admin -> 'admin123', partner -> 'partner123', customer -> 'customer123'
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Zf9.GvG.R.N.R.N.R', 'admin'),
('partner', '$2b$12$U6Y/0v60tY9R1XN5O.lUGuK6q.OqXgGGe8Oq6fL.R.hXG.N.R.N.R', 'partner'),
('customer', '$2b$12$M.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.user', 'user')
ON CONFLICT (username) DO NOTHING;

-- 2. Insert Sample Restaurants in Vĩnh Khánh Street Area (District 4, HCMC)
-- Coordinates center around 10.7612, 106.7055
INSERT INTO restaurants (
    name, specialty_dish, image_url, description, 
    description_en, description_ko, description_zh, description_ja,
    location
) VALUES 
(
    'Ốc Đào Vĩnh Khánh', 
    'Ốc hương trứng muối', 
    'https://picsum.photos/seed/oc1/400/300', 
    'Quán ốc nổi tiếng nhất phố Vĩnh Khánh với món đặc sản ốc hương trứng muối.',
    'The most famous snail restaurant on Vinh Khanh street with salted egg snails.',
    'Vinh Khanh street snails are a must-try for foodies in Saigon.',
    '胡志明市著名的蜗牛餐厅。',
    'ホーチミン市で最も有名なカタツムリ料理の店です。',
    ST_SetSRID(ST_MakePoint(106.7055, 10.7612), 4326)
),
(
    'Lẩu Gà Lá É Phú Yên', 
    'Lẩu Gà Lá É', 
    'https://picsum.photos/seed/chicken/400/300', 
    'Hương vị lẩu gà lá é chuẩn miền Trung, súp ngọt thanh và thịt gà dai ngon.',
    'Standard Central Vietnamese chicken hotpot with e-leaves, sweet broth.',
    'Phu Yen style chicken hotpot is very popular in this area.',
    '传统的富安鸡肉火锅。',
    'プーイェンスタイルの伝統的な鶏肉の鍋料理。',
    ST_SetSRID(ST_MakePoint(106.7042, 10.7605), 4326)
),
(
    'Phá Lấu Cô Thảo', 
    'Phá lấu bò', 
    'https://picsum.photos/seed/phalau/400/300', 
    'Quán phá lấu gia truyền hơn 20 năm, nổi tiếng với nước dùng béo ngậy.',
    'Over 20 years old traditional Pha Lau shop, famous for rich broth.',
    'Famous traditional beef offal soup served with bread.',
    '拥有20年历史的传统肉汤。',
    '20年の歴史を持つ伝統的なモツ煮込みです。',
    ST_SetSRID(ST_MakePoint(106.7068, 10.7621), 4326)
);
