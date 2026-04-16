# Troubleshooting CSS Import Errors in VS Code

If you see red marks under your CSS imports in VS Code, it is usually due to one of three reasons: **Missing Dependencies**, **Incorrect Paths**, or **TypeScript Configuration**.

## 1. Error: `import "leaflet/dist/leaflet.css";`

### Cause: Missing Package
The most common reason is that the `leaflet` library is not installed in your local `node_modules` folder.

**Solution:**
Open your terminal in VS Code and run:
```bash
npm install leaflet @types/leaflet
```

### Cause: TypeScript Module Resolution
TypeScript sometimes doesn't know how to "read" a CSS file as a module.

**Solution:**
Ensure you have a file named `vite-env.d.ts` or `env.d.ts` in your `src` folder with this content:
```typescript
/// <reference types="vite/client" />
```
This tells TypeScript that Vite handles CSS imports automatically.

---

## 2. Error: `import "/App.css";` vs `import "./App.css";`

### Cause: Incorrect Relative Path
In your code snippet, you wrote:
`import "/App.css";` (with a leading slash)

In web development:
*   `"/App.css"` looks at the **root** of your project (the public folder or the very top directory).
*   `"./App.css"` looks in the **current folder** where your `App.tsx` is located.

**Solution:**
Change the line to use a relative path:
```typescript
import "./App.css"; // Note the dot before the slash
```

### Cause: File Does Not Exist
Ensure that the file `App.css` actually exists in the same folder as your `App.tsx`. If you renamed it or moved it to a `styles` folder, the path must be updated (e.g., `import "./styles/App.css";`).

---

## 3. General VS Code Tip: Restart TS Server
Sometimes VS Code gets "stuck" and shows red marks even after you fix the code.

1.  Press `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac).
2.  Type **"TypeScript: Restart TS Server"** and press Enter.
3.  This will force VS Code to re-scan your files and dependencies.

## Summary Checklist
1.  Run `npm install`.
2.  Check that `App.css` is in the same folder as `App.tsx`.
3.  Use `./App.css` instead of `/App.css`.
4.  Restart the TypeScript server in VS Code.
