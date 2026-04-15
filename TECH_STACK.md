# Tech Stack Documentation - Food Map SaaS

This document outlines the technologies and libraries used to build the Food Map SaaS application.

## 1. Frontend
*   **Framework:** [React 18+](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Maps Integration:** [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview)

## 2. Backend (Python Migration)
*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) - High-performance Python web framework.
*   **Server:** [Uvicorn](https://www.uvicorn.org/) - ASGI server implementation.
*   **Database:** [PostgreSQL](https://www.postgresql.org/) with [PostGIS](https://postgis.net/) - Relational database with spatial/geographic support.
*   **Authentication:** [PyJWT](https://pyjwt.readthedocs.io/) & [Passlib](https://passlib.readthedocs.io/) - Secure token-based auth and password hashing.

## 3. Artificial Intelligence (AI)
*   **Translation:** [Google Gemini API](https://ai.google.dev/) (Handled via Python `requests`).
*   **AI Voice (TTS):** [ElevenLabs API](https://elevenlabs.io/) - Used for high-quality multilingual Text-to-Speech (Multilingual v2 model).

## 4. Key Features & Logic
*   **Spatial Queries:** Using PostGIS to store and retrieve restaurant locations (Lat/Lng).
*   **Server-Side AI:** Translation and TTS are now handled on the backend to keep API keys secure.
*   **Base64 Audio Streaming:** Audio is generated on the server and sent to the client as Base64 strings.

## 5. Deployment & Environment
*   **Hosting:** [Cloud Run](https://cloud.google.com/run) - Serverless container execution.
*   **Environment Variables:** Managed via `.env` for API keys and secrets.
