# Frontend Changes Log: Integrating Python Backend

This document tracks the specific code modifications required in `src/App.tsx` to switch from the Node.js/JSON backend to your new Python FastAPI backend.

## 1. Global Axios Configuration
**Change:** Set the Base URL at the top of the file.
```typescript
// Add this after imports
axios.defaults.baseURL = "http://localhost:8000";
```

## 2. AI Logic Refactoring
**Change:** Remove `GoogleGenAI` imports and logic from the frontend. Replace with backend API calls.

### Translation Logic
*   **Old:** `const transRes = await ai.models.generateContent(...)`
*   **New:**
    ```typescript
    const res = await axios.post("/api/translate", { text: description });
    const { en, ko, zh, ja } = res.data;
    ```

### TTS (Audio) Logic
*   **Old:** `const response = await ai.models.generateContent({ model: "...-tts" ... })`
*   **New:**
    ```typescript
    const res = await axios.post("/api/tts", { text: textToSpeak });
    const audioBase64 = res.data.audio_base64;
    // Play using HTML5 Audio
    const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
    audio.play();
    ```

## 3. Data Mapping (Coordinates)
**Change:** Ensure the frontend uses `lat` and `lng` as numbers, matching the Python `RestaurantData` model.

*   **Frontend State:** Ensure `newRest.lat` and `newRest.lng` are updated when clicking the map.
*   **Submission:** When calling `axios.post("/api/restaurants", newRest)`, ensure `lat` and `lng` are included as top-level properties.

## 4. Authentication
**Change:** Update the login/register endpoints.
*   `axios.post("/api/login", ...)`
*   `axios.post("/api/register", ...)`

## 5. Admin Stats
**Change:** Update the stats fetching logic.
*   `const res = await axios.get("/api/stats")`
*   The Python backend returns `total_users`, `total_restaurants`, and `total_visits`. Ensure the UI displays these keys correctly.
