# Backend API Specification (FastAPI)

This document details the endpoints provided by your Python backend and the data structures they expect.

## 1. Authentication
### `POST /api/register`
*   **Request Body:** `{ "username": "...", "password": "..." }`
*   **Response:** `{ "message": "Đăng ký thành công!" }` or `{ "error": "..." }`

### `POST /api/login`
*   **Request Body:** `{ "username": "...", "password": "..." }`
*   **Response:** `{ "token": "...", "role": "...", "username": "..." }`

---

## 2. Restaurant Management (CRUD)
### `GET /api/nearby`
*   **Description:** Fetches all restaurants.
*   **Response:** Array of objects. Note that `lat` and `lng` are extracted from the PostGIS `location` point.

### `POST /api/restaurants`
*   **Description:** Adds a new restaurant.
*   **Request Body (RestaurantData):**
    ```json
    {
      "name": "string",
      "specialty_dish": "string",
      "image_url": "string",
      "description": "string",
      "lat": 10.123,
      "lng": 106.456,
      "description_en": "...",
      "audio_vi": "..."
    }
    ```

### `PUT /api/restaurants/{id}`
*   **Description:** Updates an existing restaurant.
*   **Request Body:** Same as `POST`.

---

## 3. AI Services
### `POST /api/translate`
*   **Description:** Translates text into 4 languages using Gemini.
*   **Request Body:** `{ "text": "Văn bản tiếng Việt" }`
*   **Response:** `{ "en": "...", "ko": "...", "zh": "...", "ja": "..." }`

### `POST /api/tts`
*   **Description:** Generates speech using ElevenLabs.
*   **Request Body:** `{ "text": "Hello world" }`
*   **Response:** `{ "audio_base64": "..." }` (A long string representing the MP3 file).

---

## 4. System Stats
### `GET /api/stats`
*   **Response:** `{ "total_users": 0, "total_restaurants": 0, "total_visits": 0 }`
