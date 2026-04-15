# Database Setup Guide (PostgreSQL + PostGIS)

Your Python code uses spatial functions (`ST_MakePoint`, `ST_X`, etc.), which require the **PostGIS** extension for PostgreSQL.

## 1. Install PostgreSQL
Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/). During installation, ensure you also install **Stack Builder** to add the PostGIS extension.

## 2. Create the Database
Open **pgAdmin 4** or use the `psql` command line:

```sql
-- 1. Create the database
CREATE DATABASE vinhkhanh_db;

-- 2. Connect to the database and enable PostGIS
\c vinhkhanh_db;
CREATE EXTENSION postgis;
```

## 3. Create the Tables
Run the following SQL to create the tables expected by your FastAPI code:

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants Table (with Spatial Support)
CREATE TABLE restaurants (
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
    location GEOGRAPHY(POINT, 4326), -- This stores Lat/Lng
    owner_id INTEGER REFERENCES users(id)
);
```

## 4. Connection in Python
Ensure your `DB_CONFIG` in `main.py` matches your local PostgreSQL credentials:

```python
DB_CONFIG = {
    "dbname": "vinhkhanh_db",
    "user": "your_username",
    "password": "your_password",
    "host": "localhost",
    "port": "5432"
}
```
