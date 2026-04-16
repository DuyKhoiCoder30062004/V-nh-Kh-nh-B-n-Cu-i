# Full Backend Code (Python FastAPI)

This is the complete Python code for your backend, incorporating the logic for authentication, restaurant management, AI translation (Gemini), and AI voice (ElevenLabs).

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
import json
import os
import base64
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# SYSTEM CONFIGURATION
# ==========================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = "pNInz6obpgDQGcFmaJgB" # ElevenLabs Voice ID

DB_CONFIG = {
    "dbname": "vinhkhanh_db",
    "user": "admin",
    "password": "your_password", # Update this locally
    "host": "localhost",
    "port": "5432"
}

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================================
# DATA MODELS
# ==========================================
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class TranslateRequest(BaseModel):
    text: str

class RestaurantData(BaseModel):
    name: str
    specialty_dish: str
    image_url: str
    description: str
    description_en: str = ""
    description_ko: str = ""
    description_zh: str = ""
    description_ja: str = ""
    lat: float
    lng: float
    audio_vi: str = ""
    audio_en: str = ""
    audio_ko: str = ""
    audio_zh: str = ""
    audio_ja: str = ""

# ==========================================
# 1. AUTHENTICATION API
# ==========================================
@app.post("/api/register")
def register_user(req: RegisterRequest):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = %s", (req.username,))
        if cursor.fetchone():
            return {"error": "Tên đăng nhập đã tồn tại!"}

        hashed_password = pwd_context.hash(req.password[:70])
        cursor.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, 'user')",
            (req.username, hashed_password)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Đăng ký thành công!"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/login")
def login_user(req: LoginRequest):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM users WHERE username = %s", (req.username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user or not pwd_context.verify(req.password[:70], user['password_hash']):
            return {"error": "Sai tài khoản hoặc mật khẩu!"}

        expire = datetime.utcnow() + timedelta(hours=24)
        payload = {"sub": user['username'], "role": user['role'], "exp": expire}
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

        return {
            "message": "Đăng nhập thành công!", 
            "token": token, 
            "role": user['role'], 
            "username": user['username'],
            "id": user['id']
        }
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# 2. RESTAURANT CRUD API
# ==========================================
@app.get("/api/nearby")
def get_nearby_restaurants():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id, name, description, specialty_dish, image_url,
                   description_en, description_ko, description_zh, description_ja,
                   audio_vi, audio_en, audio_ko, audio_zh, audio_ja,
                   ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
            FROM restaurants;
        """)
        restaurants = cursor.fetchall()
        cursor.close()
        conn.close()
        return restaurants
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/restaurants")
def add_restaurant(req: RestaurantData):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO restaurants
            (name, specialty_dish, image_url, description, description_en, description_ko, description_zh, description_ja,
             audio_vi, audio_en, audio_ko, audio_zh, audio_ja, location)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
        """, (req.name, req.specialty_dish, req.image_url, req.description, req.description_en,
              req.description_ko, req.description_zh, req.description_ja,
              req.audio_vi, req.audio_en, req.audio_ko, req.audio_zh, req.audio_ja, req.lng, req.lat))
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Đã thêm quán ăn thành công!"}
    except Exception as e:
        return {"error": str(e)}

@app.put("/api/restaurants/{rest_id}")
def update_restaurant(rest_id: int, req: RestaurantData):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE restaurants
            SET name=%s, specialty_dish=%s, image_url=%s, description=%s, 
                description_en=%s, description_ko=%s, description_zh=%s, description_ja=%s,
                audio_vi=%s, audio_en=%s, audio_ko=%s, audio_zh=%s, audio_ja=%s,
                location=ST_SetSRID(ST_MakePoint(%s, %s), 4326)
            WHERE id = %s
        """, (req.name, req.specialty_dish, req.image_url, req.description, req.description_en,
              req.description_ko, req.description_zh, req.description_ja,
              req.audio_vi, req.audio_en, req.audio_ko, req.audio_zh, req.audio_ja, req.lng, req.lat, rest_id))
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Đã cập nhật quán ăn thành công!"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/api/restaurants/{rest_id}")
def delete_restaurant(rest_id: int):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM restaurants WHERE id = %s", (rest_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Đã xóa quán ăn khỏi hệ thống!"}
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# 3. AI SERVICES (TRANSLATE & TTS)
# ==========================================
@app.post("/api/translate")
def translate_text(req: TranslateRequest):
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {'Content-Type': 'application/json'}
        prompt = f"""Translate the following Vietnamese text into English, Korean, Chinese, and Japanese. 
        Return ONLY a JSON object with keys 'en', 'ko', 'zh', 'ja'.
        Text: {req.text}"""
        
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        response = requests.post(url, headers=headers, json=payload)
        data = response.json()
        
        raw_text = data['candidates'][0]['content']['parts'][0]['text']
        raw_json = raw_text.replace("```json", "").replace("```", "").strip()
        return json.loads(raw_json)
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/tts")
def generate_audio(request_data: dict):
    text = request_data.get("text")
    if not text or not ELEVENLABS_API_KEY:
        return {"error": "Missing text or API Key"}

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {"Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": ELEVENLABS_API_KEY}
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
    }

    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code != 200:
            return {"error": f"ElevenLabs Error: {response.text}"}
        
        audio_base64 = base64.b64encode(response.content).decode("utf-8")
        return {"audio_base64": audio_base64}
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# 4. SYSTEM STATS
# ==========================================
@app.get("/api/stats")
def get_system_stats():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'user'")
        total_users = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM restaurants")
        total_rests = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return {"total_users": total_users, "total_restaurants": total_rests, "total_visits": total_users * 10 + 50}
    except Exception as e:
        return {"error": str(e)}
```
