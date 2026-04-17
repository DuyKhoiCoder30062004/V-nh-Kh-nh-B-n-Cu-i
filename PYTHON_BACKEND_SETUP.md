# Local Project Setup: Environment & Database

To run this project on your computer, you need to follow these steps to set up your environment and database.

## 1. Backend Setup (Python)

### Create `.env` file
Create a file named `.env` in your backend folder and add your keys:
```env
# Google AI for Translation
GEMINI_API_KEY=your_gemini_key_here

# ElevenLabs for Audio
ELEVENLABS_API_KEY=your_eleven_key_here
ELEVEN_VOICE_ID=pNInz6obpgDQGcFmaJgB

# JWT Security
JWT_SECRET=anything_random_here
```

### Install Requirements
```bash
pip install fastapi uvicorn psycopg2-binary requests passlib[bcrypt] pyjwt python-dotenv
```

---

## 2. Database Setup (PostgreSQL)

Run this SQL in **pgAdmin 4** to create the tables. Note: You **MUST** have the **PostGIS** extension installed.

```sql
-- Enable Spatial support
CREATE EXTENSION IF NOT EXISTS postgis;

-- User Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

-- Restaurant Table
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
    location GEOGRAPHY(POINT, 4326)
);
```

---

## 3. Frontend Setup (React/Vite)

### Install Dependencies
```bash
npm install axios leaflet react-leaflet
```

### Run Project
1.  **Backend**: `python main.py` (Runs on port 8000)
2.  **Frontend**: `npm run dev` (Runs on port 3000)

### Troubleshooting
- **CORS Errors**: Ensure the Python backend has the `CORSMiddleware` configured as shown in `main.py`.
- **Map Icons**: Ensure you have the Leaflet CSS and image fixes in `App.tsx` as provided.
- **Port Busy**: If port 8000 is used, change the port in `main.py` and update `axios.defaults.baseURL` in `App.tsx`.
