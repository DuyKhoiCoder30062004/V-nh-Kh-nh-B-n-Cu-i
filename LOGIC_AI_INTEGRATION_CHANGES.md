# Logic Changes: AI Integration (Translation & TTS)

This document describes how to move AI logic from the frontend SDK to the Python backend endpoints.

## 1. Text Translation (`autoGenerateContent`)
Instead of using the `@google/genai` library in the browser, the app will now call the Python `/api/translate` endpoint.

**New Logic (Python):**
```typescript
const autoGenerateContent = async () => {
  if (!newRest.description) return alert("Vui lòng nhập mô tả Tiếng Việt!");
  
  setIsGeneratingAll(true);
  try {
    // Call Python backend for translation
    const res = await axios.post("/api/translate", { text: newRest.description });
    
    // Python returns: { en, ko, zh, ja }
    const { en, ko, zh, ja } = res.data;
    
    setNewRest(prev => ({
      ...prev,
      description_en: en,
      description_ko: ko,
      description_zh: zh,
      description_ja: ja
    }));

    // Now trigger TTS for each language
    await generateAllAudio(res.data);
    
  } catch (err) {
    console.error("Lỗi AI:", err);
    alert("Lỗi khi dịch thuật từ Server.");
  } finally {
    setIsGeneratingAll(false);
  }
};
```

## 2. Audio Generation (TTS)
The Python backend uses **ElevenLabs** and returns a **Base64** string. You need to update the `generateTTS` function to handle this.

**New Logic (Python):**
```typescript
const generateTTS = async (text: string, lang: string) => {
  try {
    const res = await axios.post("/api/tts", { text });
    // Python returns: { audio_base64: "..." }
    return res.data.audio_base64;
  } catch (err) {
    console.error(`Lỗi TTS [${lang}]:`, err);
    return "";
  }
};
```

## 3. Audio Playback
Since the audio is now an MP3 (Base64) from ElevenLabs, you can use the standard `Audio` object instead of the complex Web Audio API buffer logic.

**New Logic (Python):**
```typescript
const playAudio = (base64Data: string) => {
  if (!base64Data) return alert("Không có dữ liệu âm thanh!");
  const audio = new Audio(`data:audio/mpeg;base64,${base64Data}`);
  audio.play();
};
```

## 4. Cleanup
You can now **remove** the following from your `App.tsx`:
*   `import { GoogleGenAI, Modality } from "@google/genai";`
*   The `ai` instance initialization.
*   The `playBuffer` and `initAudioContext` functions.
