# Full Backend Code (Python FastAPI - Verified)

This is the non-ambiguous Python backend code. It fixes the database commit issues and ensures AI generated content is correctly persisted.

```python
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
import jwt
import bcrypt
from datetime import datetime, timedelta
import json
import os
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS for React frontend (Port 3000)
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
VOICE_ID = os.getenv("ELEVEN_VOICE_ID", "MqsnLOwcpkRUz9a4AhNi")

# Database Connection Settings
DB_CONFIG = {
    "dbname": "postgres",
    "user": "postgres",
    "password": "CrAzYbObEr@54321",
    "host": "localhost",
    "port": "5432"
}

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key")
ALGORITHM = "HS256"

# ==========================================
# AUTH HELPERS
# ==========================================
def hash_password(password: str) -> str:
    byte_pwd = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(byte_pwd, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))
    except: 
        return False

class AuthRequest(BaseModel):
    username: str
    password: str

class RestaurantData(BaseModel):
    name: str = ""
    specialty_dish: str = ""
    image_url: str = ""
    description: str = ""
    description_en: str = ""
    description_ko: str = ""
    description_zh: str = ""
    description_ja: str = ""
    lat: float = 0.0
    lng: float = 0.0
    audio_vi: str = ""
    audio_en: str = ""
    audio_ko: str = ""
    audio_zh: str = ""
    audio_ja: str = ""

# ==========================================
# 1. AUTHENTICATION ROUTES
# ==========================================
@app.post("/api/register")
def register_user(req: AuthRequest):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        hashed = hash_password(req.password)
        cursor.execute("INSERT INTO users (username, password_hash, role) VALUES (%s, %s, 'user')", (req.username, hashed))
        conn.commit()
        cursor.close(); conn.close()
        return {"message": "Success"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/login")
def login_user(req: AuthRequest):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM users WHERE username = %s", (req.username,))
        user = cursor.fetchone()
        cursor.close(); conn.close()
        
        if user and verify_password(req.password, user['password_hash']):
            expire = datetime.utcnow() + timedelta(hours=24)
            token = jwt.encode({"sub": user['username'], "role": user['role'], "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
            return {"token": token, "role": user['role'], "username": user['username']}
        
        return {"error": "Invalid username or password"}
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# 2. RESTAURANT & STATS ROUTES
# ==========================================
@app.get("/api/nearby")
def get_restaurants():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Real-time Visit Tracking (needs commit)
        cursor.execute("UPDATE app_stats SET value_int = value_int + 1 WHERE key_name = 'total_visits'")
        
        cursor.execute("""
            SELECT *, 
                   ST_X(location::geometry) as lng, 
                   ST_Y(location::geometry) as lat 
            FROM restaurants
        """)
        data = cursor.fetchall()
        conn.commit()
        cursor.close(); conn.close()
        return data
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/restaurants")
def add_restaurant(req: RestaurantData):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO restaurants (name, specialty_dish, image_url, description, location) 
            VALUES (%s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
        """, (req.name, req.specialty_dish, req.image_url, req.description, req.lng, req.lat))
        conn.commit()
        cursor.close(); conn.close()
        return {"message": "Restaurant added successfully"}
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
                location=ST_SetSRID(ST_MakePoint(%s, %s), 4326) 
            WHERE id = %s
        """, (req.name, req.specialty_dish, req.image_url, req.description, req.lng, req.lat, rest_id))
        conn.commit()
        cursor.close(); conn.close()
        return {"message": "Restaurant updated successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/api/restaurants/{rest_id}")
def delete_restaurant(rest_id: int):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM restaurants WHERE id = %s", (rest_id,))
        conn.commit()
        cursor.close(); conn.close()
        return {"message": "Restaurant deleted"}
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# 3. AI SERVICES (DB UPDATE CAPABLE)
# ==========================================
@app.post("/api/translate")
def translate(payload: dict = Body(...)):
    text = payload.get("text")
    rest_id = payload.get("rest_id")
    
    if not text:
        return {"error": "No text provided"}
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    prompt = f"""Dịch đoạn văn ẩm thực sau sang 4 ngôn ngữ (en, ko, zh, ja). 
    Trả về JSON chuẩn duy nhất: {{"en": "...", "ko": "...", "zh": "...", "ja": "..."}}. 
    Văn bản: {text}"""
    
    try:
        resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
        content = resp.json()['candidates'][0]['content']['parts'][0]['text']
        clean_json = content.replace("```json", "").replace("```", "").strip()
        translations = json.loads(clean_json)
        
        # Persist translations immediately
        if rest_id:
            conn = psycopg2.connect(**DB_CONFIG); cur = conn.cursor()
            cur.execute("""
                UPDATE restaurants SET 
                    description_en=%s, description_ko=%s, description_zh=%s, description_ja=%s 
                WHERE id=%s
            """, (translations["en"], translations["ko"], translations["zh"], translations["ja"], rest_id))
            conn.commit(); cur.close(); conn.close()
            
        return translations
    except Exception as e:
        return {"error": f"Gemini Error: {str(e)}"}

@app.post("/api/tts")
def tts(payload: dict = Body(...)):
    text = payload.get("text")
    rest_id = payload.get("rest_id")
    lang = payload.get("lang")
    
    if not text or not ELEVENLABS_API_KEY:
        return {"error": "Missing components"}
        
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"}
    try:
        resp = requests.post(url, json={"text": text, "model_id": "eleven_multilingual_v2"}, headers=headers)
        if resp.status_code != 200: return {"error": f"ElevenLabs error"}
            
        audio_b64 = base64.b64encode(resp.content).decode("utf-8")
        
        # Persist audio immediately
        if rest_id and lang:
            conn = psycopg2.connect(**DB_CONFIG); cur = conn.cursor()
            cur.execute(f"UPDATE restaurants SET audio_{lang}=%s WHERE id=%s", (audio_b64, rest_id))
            conn.commit(); cur.close(); conn.close()
            
        return {"audio_base64": audio_b64}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/stats")
def get_stats():
    try:
        conn = psycopg2.connect(**DB_CONFIG); cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'user'"); u = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM restaurants"); r = cur.fetchone()[0]
        cur.execute("SELECT value_int FROM app_stats WHERE key_name = 'total_visits'"); v_row = cur.fetchone()
        v = v_row[0] if v_row else 0
        cur.close(); conn.close()
        return {"total_users": u, "total_restaurants": r, "total_visits": v}
    except:
        return {"total_users": 0, "total_restaurants": 0, "total_visits": 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```
  
