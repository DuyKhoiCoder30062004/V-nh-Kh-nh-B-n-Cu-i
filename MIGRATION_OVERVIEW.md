# Migration Overview: Node.js to Python FastAPI

This document summarizes the architectural shift from the current Node.js/JSON prototype to a production-ready Python/PostgreSQL stack.

## 1. The Core Shift
We are moving from a **Client-Side AI** model to a **Server-Side AI** model.

*   **Current (Node.js):** The React app calls Gemini API directly. API keys are exposed in the browser.
*   **New (Python):** The React app calls your Python server. The Python server calls Gemini and ElevenLabs. API keys stay hidden on your machine.

## 2. Technology Changes
| Component | Old (Current) | New (Python Stack) |
| :--- | :--- | :--- |
| **Backend Language** | Node.js (TypeScript) | Python 3.10+ |
| **Web Framework** | Express.js | FastAPI |
| **Database** | `db.json` (Local file) | PostgreSQL + PostGIS (Spatial DB) |
| **AI Translation** | Frontend SDK (`@google/genai`) | Backend API (`requests` to Gemini) |
| **AI Voice (TTS)** | Gemini TTS (Frontend) | ElevenLabs (Backend) |
| **Audio Format** | Raw PCM (Web Audio API) | Base64 MPEG (Standard HTML5 Audio) |

## 3. Benefits
1.  **Security:** Your Gemini and ElevenLabs API keys are never sent to the user's browser.
2.  **Performance:** PostgreSQL is significantly faster and more reliable than a JSON file for data storage.
3.  **Spatial Accuracy:** PostGIS allows for professional geographic calculations (distance, proximity) using the `location` column.
4.  **Voice Quality:** ElevenLabs provides more human-like voices compared to the standard Gemini TTS.

## 4. Migration Status
*   [x] Backend Logic Defined (Python)
*   [x] Database Schema Designed
*   [ ] Frontend Integration (Pending your local implementation)
