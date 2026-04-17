# Frontend Integration: Python Backend Migration

This document details the high-level steps required to adapt our current React frontend to the new Python FastAPI backend.

## 1. Structural Changes
- **Remove `database.json`**: The local JSON mockup is no longer needed as we are using a real PostgreSQL database through the Python API.
- **Update Environment Variables**: The `GEMINI_API_KEY` and `ELEVENLABS_API_KEY` should be moved to the backend's `.env` file. The frontend no longer needs direct access to these AI keys.

## 2. API Communication (Axios)
- **Base URL**: Ensure `axios.defaults.baseURL` is set to the Python server address (typically `http://localhost:8000`).
- **Endpoint Sync**: All `axios` calls in `App.tsx` must be audited to match the new endpoints:
    - Auth: `/api/login` and `/api/register`.
    - Data: `/api/nearby` for fetching markers.
    - CRUD: `/api/restaurants` for adding, and `/api/restaurants/{id}` for updating/deleting.
    - AI: `/api/translate` and `/api/tts`.

## 3. Data Schema Alignment
- **Restaurant Interface**: The properties returned from `/api/nearby` (like `lat` and `lng`) are now top-level numbers. The frontend state should reflect this directly rather than parsing a complex JSON string.
- **User Objects**: The login response now returns a flat object with `token`, `role`, and `username`. This info is stored in `localStorage` for session persistence.

## 4. AI Enhancement
- All translation and voice synthesis logic is removed from the frontend.
- The frontend simply "asks" the backend for translations and audio buffers.
- This secures our API keys and improves performance by leveraging the server's processing power.
