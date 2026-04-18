# Full Backend Code: main.py (Fixed Logic)

This version includes the missing headers and commit logic for ElevenLabs and stats.

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

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("ELEVEN_VOICE_ID", "MqsnLOwcpkRUz9a4AhNi")

DB_CONFIG = {
    "dbname": "postgres",
    "user": "postgres",
    "password": "CrAzYbObEr@54321",
    "host": "localhost",
    "port": "5432"
}

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key")

@app.get("/api/nearby")
def get_restaurants():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    # Increment visit counter
    cur.execute("UPDATE app_stats SET value_int = value_int + 1 WHERE key_name = 'total_visits'")
    cur.execute("""
        SELECT *, ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat 
        FROM restaurants
    """)
    data = cur.fetchall()
    conn.commit()
    cur.close(); conn.close()
    return data

@app.post("/api/translate")
def translate(payload: dict = Body(...)):
    text = payload.get("text")
    rest_id = payload.get("rest_id")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    prompt = f"Translate to JSON {{'en': '...', 'ko': '...', 'zh': '...', 'ja': '...'}}: {text}"
    resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
    content = resp.json()['candidates'][0]['content']['parts'][0]['text']
    clean = content.replace("```json", "").replace("```", "").strip()
    trans = json.loads(clean)
    
    if rest_id:
        conn = psycopg2.connect(**DB_CONFIG); cur = conn.cursor()
        cur.execute("""
            UPDATE restaurants SET 
            description_en=%s, description_ko=%s, description_zh=%s, description_ja=%s 
            WHERE id=%s
        """, (trans["en"], trans["ko"], trans["zh"], trans["ja"], rest_id))
        conn.commit(); cur.close(); conn.close()
    return trans

@app.post("/api/tts")
def tts(payload: dict = Body(...)):
    text = payload.get("text")
    rest_id = payload.get("rest_id")
    lang = payload.get("lang")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json" # CRITICAL FIX
    }
    resp = requests.post(url, json={"text": text, "model_id": "eleven_multilingual_v2"}, headers=headers)
    b64 = base64.b64encode(resp.content).decode("utf-8")
    
    if rest_id and lang:
        conn = psycopg2.connect(**DB_CONFIG); cur = conn.cursor()
        cur.execute(f"UPDATE restaurants SET audio_{lang}=%s WHERE id=%s", (b64, rest_id))
        conn.commit(); cur.close(); conn.close()
    return {"audio_base_base64": b64}

@app.get("/api/stats")
def get_stats():
    conn = psycopg2.connect(**DB_CONFIG); cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users"); u = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM restaurants"); r = cur.fetchone()[0]
    cur.execute("SELECT value_int FROM app_stats WHERE key_name = 'total_visits'"); v = cur.fetchone()[0]
    cur.close(); conn.close()
    return {"total_users": u, "total_restaurants": r, "total_visits": v}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```
