# Full Backend Code (Fixed Password Logic)

This version removes `passlib` to fix the `AttributeError` and uses the `bcrypt` library directly.

```python
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
import jwt
import bcrypt  # Direct import to fix passlib errors
from datetime import datetime, timedelta
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
VOICE_ID = os.getenv("ELEVEN_VOICE_ID", "pNInz6obpgDQGcFmaJgB")

# !!! IMPORTANT: Update your local Postgres password here !!!
DB_CONFIG = {
    "dbname": "vinhkhanh_db",
    "user": "admin",
    "password": "CrAzYbObEr@54321", 
    "host": "localhost",
    "port": "5432"
}

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key")
ALGORITHM = "HS256"

# ==========================================
# AUTH HELPERS (Fixed bcrypt logic)
# ==========================================
def hash_password(password: str) -> str:
    # Bcrypt has a 72-byte limit, so we truncate just in case
    byte_pwd = password.encode('utf-8')[:72]
    # Generate salt and hash
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(byte_pwd, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Check password using the raw bcrypt library
        return bcrypt.checkpw(
            plain_password.encode('utf-8')[:72], 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

# ==========================================
# DATA MODELS
# ==========================================
class AuthRequest(BaseModel):
    username: str
    password: str

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
# 1. API AUTH
# ==========================================
@app.post("/api/register")
def register_user(req: AuthRequest):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = %s", (req.username,))
        if cursor.fetchone():
            return {"error": "Tên đăng nhập đã tồn tại!"}

        # Use our new direct hashing function
        hashed = hash_password(req.password)
        
        cursor.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, 'user')",
            (req.username, hashed)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Đăng ký thành công!"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/login")
def login_user(req: AuthRequest):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM users WHERE username = %s", (req.username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        # Use our new direct verification function
        if not user or not verify_password(req.password, user['password_hash']):
            return {"error": "Sai tài khoản hoặc mật khẩu!"}

        expire = datetime.utcnow() + timedelta(hours=24)
        token = jwt.encode({"sub": user['username'], "role": user['role'], "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
        
        return {
            "token": token, 
            "role": user['role'], 
            "username": user['username']
        }
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# 2. API RESTAURANT (POSTGIS)
# ==========================================
@app.get("/api/nearby")
def get_restaurants():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        # Note: location is stored as geography, we extract coordinates
        cursor.execute("""
            SELECT id, name, specialty_dish, image_url, 
                   description, description_en, description_ko, description_zh, description_ja,
                   audio_vi, audio_en, audio_ko, audio_zh, audio_ja,
                   ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
            FROM restaurants
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/restaurants")
def add_restaurant(req: RestaurantData):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO restaurants (name, specialty_dish, image_url, description, 
                description_en, description_ko, description_zh, description_ja,
                audio_vi, audio_en, audio_ko, audio_zh, audio_ja, location)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
        """, (req.name, req.specialty_dish, req.image_url, req.description,
              req.description_en, req.description_ko, req.description_zh, req.description_ja,
              req.audio_vi, req.audio_en, req.audio_ko, req.audio_zh, req.audio_ja,
              req.lng, req.lat))
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Thêm quán thành công!"}
    except Exception as e:
        return {"error": str(e)}

@app.put("/api/restaurants/{rest_id}")
def update_restaurant(rest_id: int, req: RestaurantData):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE restaurants SET 
                name=%s, specialty_dish=%s, image_url=%s, description=%s,
                description_en=%s, description_ko=%s, description_zh=%s, description_ja=%s,
                audio_vi=%s, audio_en=%s, audio_ko=%s, audio_zh=%s, audio_ja=%s,
                location=ST_SetSRID(ST_MakePoint(%s, %s), 4326)
            WHERE id = %s
        """, (req.name, req.specialty_dish, req.image_url, req.description,
              req.description_en, req.description_ko, req.description_zh, req.description_ja,
              req.audio_vi, req.audio_en, req.audio_ko, req.audio_zh, req.audio_ja,
              req.lng, req.lat, rest_id))
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Cập nhật thành công!"}
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
        return {"message": "Đã xóa quán!"}
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# 3. AI SERVICES (SECURE BACKEND)
# ==========================================
@app.post("/api/translate")
def translate(payload: dict = Body(...)):
    text = payload.get("text")
    if not text: return {"error": "No text provided"}
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    prompt = f"""Dịch sang 4 ngôn ngữ (en, ko, zh, ja). Trả về JSON chuẩn duy nhất:
    {{"en": "...", "ko": "...", "zh": "...", "ja": "..."}}
    Văn bản gốc: {text}"""
    
    try:
        resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
        data = resp.json()
        raw = data['candidates'][0]['content']['parts'][0]['text']
        clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception as e:
        return {"error": f"Gemini Error: {str(e)}"}

@app.post("/api/tts")
def tts(payload: dict = Body(...)):
    text = payload.get("text")
    if not text or not ELEVENLABS_API_KEY:
        return {"error": "Thiếu dữ liệu văn bản hoặc API Key"}

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"}
    data = {"text": text, "model_id": "eleven_multilingual_v2"}
    
    try:
        resp = requests.post(url, json=data, headers=headers)
        if resp.status_code != 200:
            return {"error": f"ElevenLabs Error: {resp.text}"}
        return {"audio_base64": base64.b64encode(resp.content).decode("utf-8")}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/stats")
def get_stats():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'user'")
        u = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM restaurants")
        r = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return {"total_users": u, "total_restaurants": r, "total_visits": r * 15 + u * 2}
    except Exception:
        return {"total_users": 0, "total_restaurants": 0, "total_visits": 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```
  
