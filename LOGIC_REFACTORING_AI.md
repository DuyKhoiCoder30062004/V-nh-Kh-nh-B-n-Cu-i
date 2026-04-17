# Refactoring Logic: AI Integration (Translate & TTS)

A major improvement in this version is the move from Frontend AI processing to **Backend AI Processing**. This hides our API keys and simplifies the frontend code.

## 1. Removing direct Gemini SDK
The `@google/generative-ai` package and the `ai` instance are removed from `App.tsx`.

## 2. Updated Translation Logic
`autoGenerateContent` now sends the Vietnamese text to the backend. The backend handles the complex prompting and JSON parsing.

**Revised Function Flow:**
1.  **POST `/api/translate`**: Sends `{text: description}`.
2.  **Receive JSON**: Receives translations for English, Korean, Chinese, and Japanese.
3.  **Update State**: Updates the `newRest` state with translated descriptions.

## 3. Updated TTS Logic
Instead of generating audio in the browser, the app calls the backend for each language.

**Revised Function Flow:**
1.  **POST `/api/tts`**: Sends `{text: "..."}` for each translated string.
2.  **Receive Base64**: The Python backend returns a Base64 encoded MP3 string from ElevenLabs.
3.  **Playback**: The frontend uses a standard HTML5 `Audio` object to play the Base64 stream.

```typescript
const playAudio = (base64Data: string) => {
  if (!base64Data) return;
  const audio = new Audio(`data:audio/mpeg;base64,${base64Data}`);
  audio.play();
};
```

## 4. Why this is better
- **Security**: The ElevenLabs and Gemini API keys are now stored in `main.py` (.env), so they are never visible to the user in the browser's "Network" tab.
- **Reliability**: Server-side processing is more stable than running heavy AI models in the user's mobile browser.
