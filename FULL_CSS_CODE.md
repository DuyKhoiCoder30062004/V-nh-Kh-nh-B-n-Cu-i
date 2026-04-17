/* ==========================================================
   VOICEMAP SAAS - MODERN CSS STYLING
   Save this as: src/App.css
   ========================================================== */

:root {
  --primary: #ef4444;
  --secondary: #3b82f6;
  --dark: #1f2937;
  --light: #f3f4f6;
  --glass: rgba(255, 255, 255, 0.85);
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow-x: hidden;
}

.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

/* --- AUTH SCREENS --- */
.auth-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.auth-card h2 { margin-top: 0; color: var(--dark); }
.auth-card input {
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  box-sizing: border-box;
}

.auth-card button {
  width: 100%;
  padding: 0.8rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}

.auth-card p { margin-top: 1.5rem; font-size: 0.9rem; color: var(--secondary); cursor: pointer; }
.error { color: #ef4444; font-size: 0.85rem; }

/* --- FLOATING COMPONENTS --- */
.floating-bar {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: var(--glass);
  backdrop-filter: blur(10px);
  padding: 0.6rem 1.5rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  font-weight: 500;
}

.floating-bar button {
  background: #eee;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 1rem;
  cursor: pointer;
}

.portal-toggle {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.portal-toggle button {
  background: var(--dark);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 3rem;
  border: none;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
}

.lang-selector {
  position: fixed;
  top: 5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lang-selector button {
  background: white;
  border: 2px solid transparent;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.lang-selector button.active { border-color: var(--primary); transform: scale(1.1); }

/* --- POPUP STYLING --- */
.popup-card { width: 220px; text-align: left; }
.popup-card img { width: 100%; border-radius: 0.5rem; margin-bottom: 0.5rem; object-fit: cover; height: 120px; }
.popup-card h3 { margin: 0; font-size: 1.1rem; color: var(--dark); }
.popup-card p { font-size: 0.85rem; line-height: 1.4; color: #666; }
.popup-card button {
  width: 100%;
  background: var(--secondary);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.4rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

/* --- ADMIN DASHBOARD --- */
.admin-portal {
  background: #f8fafc;
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  box-sizing: border-box;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.admin-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.admin-card h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 1rem; }

form input, form textarea {
  width: 100%;
  padding: 0.7rem;
  margin-bottom: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  box-sizing: border-box;
}

.geo-inputs { display: flex; gap: 0.5rem; }
.form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.save-btn { flex: 1; background: var(--secondary) !important; color: white !important; }

.admin-card button {
  background: #eee;
  border: none;
  padding: 0.7rem;
  border-radius: 0.4rem;
  cursor: pointer;
}

.scroll-list { max-height: 400px; overflow-y: auto; }
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  border-bottom: 1px solid #f1f1f1;
}

.delete-btn { color: white; background: #ef4444 !important; }
.stats-box p { font-size: 1.1rem; margin: 1rem 0; font-weight: bold; }
