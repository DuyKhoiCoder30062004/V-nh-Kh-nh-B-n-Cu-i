# Frontend Integration Guide (React to FastAPI)

To connect your React frontend to your new Python backend, you need to update how the frontend communicates with the API.

## 1. Update Axios Configuration
In your React app (e.g., `src/App.tsx`), you should set the base URL for your Python server.

```typescript
import axios from 'axios';

// Point this to your FastAPI server
axios.defaults.baseURL = 'http://localhost:8000';
```

## 2. Handling ElevenLabs Audio (Base64)
Your Python code returns audio as a **Base64 string**. You need a function in React to play this.

```typescript
const playBase64Audio = (base64String: string) => {
  const audioSrc = `data:audio/mpeg;base64,${base64String}`;
  const audio = new Audio(audioSrc);
  audio.play();
};

// Usage in your component:
// const res = await axios.post('/api/tts', { text: "Hello" });
// playBase64Audio(res.data.audio_base64);
```

## 3. Data Structure Mapping
Ensure your frontend forms match the `RestaurantData` model in your Python code:
*   Python expects `lat` and `lng` as floats.
*   Python expects `description_en`, `description_ko`, etc.

## 4. Vite Proxy (Optional but Recommended)
To avoid CORS issues during development, update your `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```
This allows you to keep using `axios.post('/api/login')` without typing the full URL every time.
