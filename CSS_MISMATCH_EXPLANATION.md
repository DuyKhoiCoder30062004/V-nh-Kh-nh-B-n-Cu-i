# Why your CSS changes are not showing up

The reason your `App.css` changes are not reflecting in your `App.tsx` is a **mismatch between the CSS selectors and the HTML classes** used in your code.

## 1. The Selectors Don't Match
Your `App.css` contains styles for classes and IDs that **do not exist** in your `App.tsx` JSX.

*   **In `App.css`**, you have: `.counter`, `.hero`, `#center`, `#next-steps`, `#docs`.
*   **In `App.tsx`**, you are using: `auth-container`, `auth-card`, `app-container`, `floating-bar`, `lang-selector`, `popup-card`.

Because your React code never uses `className="hero"` or `id="center"`, the browser has nothing to apply those styles to.

## 2. The CSS looks like "Starter Code"
The CSS you provided appears to be the default code from a Vite or React starter template. However, your `App.tsx` is a custom **Food Map** application. 

To fix this, you need to write CSS that targets the classes you actually used in your `App.tsx`.

### Example Fix:
If you want to style your **Map Container**, you should add this to `App.css`:

```css
/* Target the class you used in App.tsx */
.app-container {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.floating-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
```

## 3. Check for "Global" vs "Module" CSS
If you are using Tailwind CSS (which is configured in this project), many developers prefer using utility classes directly in the `className` attribute instead of writing custom CSS in `App.css`.

**If you want to use the custom CSS you wrote, you MUST update your React code to use those classes:**

```tsx
// App.tsx
return (
  <div className="hero"> {/* Now the .hero styles from App.css will work */}
    <div id="center">   {/* Now the #center styles will work */}
       ...
    </div>
  </div>
);
```

## Summary Checklist
1.  **Match Names:** Ensure the `className` in your `.tsx` file exactly matches the `.class` in your `.css` file.
2.  **Remove Dead Code:** Delete the `.hero`, `.counter`, etc., from `App.css` if you aren't using them.
3.  **Verify Import:** You already have `import "./App.css";` at the top, which is correct.
