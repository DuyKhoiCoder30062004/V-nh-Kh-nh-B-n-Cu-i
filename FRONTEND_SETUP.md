# Frontend Setup Guide (React + TypeScript)

This guide explains how to set up your development environment for the frontend side of the Food Map SaaS application.

## 1. Recommended IDE
For frontend development (React, TypeScript, Tailwind CSS), you have two primary professional choices:

### Option A: Visual Studio Code (Highly Recommended)
*   **Why:** It is the industry standard for frontend development. It has superior extensions for TypeScript, Tailwind CSS, and React.
*   **Setup:** Download from [code.visualstudio.com](https://code.visualstudio.com/).
*   **Essential Extensions:**
    *   *ESLint* & *Prettier* (for code formatting)
    *   *Tailwind CSS IntelliSense* (for CSS autocomplete)
    *   *ES7+ React/Redux/React-Native snippets*

### Option B: PyCharm Professional
*   **Why:** If you already use PyCharm for Python and have the **Professional Edition**, it includes full support for Web development (JS/TS/React).
*   **Note:** The *Community Edition* of PyCharm does **not** support TypeScript/React well. If you are on Community, use VS Code instead.

---

## 2. Environment Prerequisites
1.  **Install Node.js:** Download the **LTS (Long Term Support)** version from [nodejs.org](https://nodejs.org/). This includes `npm` (Node Package Manager).
2.  **Verify Installation:** Open your terminal and run:
    ```bash
    node -v
    npm -v
    ```

---

## 3. Project Setup
1.  **Open the Project:** Open the `applet` folder (containing `package.json`) in your chosen IDE.
2.  **Install Dependencies:** Open the integrated terminal in your IDE and run:
    ```bash
    npm install
    ```
    This will install React, TypeScript, Tailwind CSS, Axios, and other necessary libraries.

---

## 4. Connecting to the Python Backend
Since your backend is now running on Python (FastAPI), you must ensure the frontend knows where to send requests.

### Update Axios Base URL
In your `src/App.tsx`, you should set the base URL right after the import statements at the top of the file. This ensures every request made with `axios` automatically goes to your Python server.

**In `src/App.tsx`:**
```typescript
import axios from 'axios';

// Add this line here (around line 3)
axios.defaults.baseURL = 'http://localhost:8000';
```

### Configure Vite Proxy
To avoid CORS (Cross-Origin Resource Sharing) errors during development, update your `vite.config.ts` file:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

---

## 5. Running the Frontend
In your IDE terminal, run:
```bash
npm run dev
```
*   The frontend will typically be available at `http://localhost:3000`.
*   Any request starting with `/api` will be automatically forwarded to your Python backend at `http://localhost:8000`.
