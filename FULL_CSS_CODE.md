/* ==========================================================
   VOICEMAP SAAS - INTEGRATED CSS STYLING
   Combines Starter CSS and SaaS Dashboard
   ========================================================== */

:root {
  --primary: #ef4444;
  --secondary: #3b82f6;
  --dark: #1f2937;
  --light: #f3f4f6;
  --glass: rgba(255, 255, 255, 0.85);

  /* User Provided Starter Variables */
  --accent: #3b82f6;
  --accent-bg: rgba(59, 130, 246, 0.1);
  --accent-border: rgba(59, 130, 246, 0.3);
  --border: #e2e8f0;
  --text-h: #1a202c;
  --social-bg: #f7fafc;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow-x: hidden;
  background: var(--light);
}

/* --- STARTER CSS BLOCK (UNCHANGED) --- */
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;
}
.counter:hover { border-color: var(--accent-border); }
.counter:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.hero {
  position: relative;
  width: 100%;
  height: 200px;
  margin-bottom: 2rem;
}
.hero .base, .hero .framework, .hero .vite {
  inset-inline: 0;
  margin: 0 auto;
}
.hero .base { width: 170px; position: relative; z-index: 0; }
.hero .framework, .hero .vite { position: absolute; }
.hero .framework {
  z-index: 1; top: 34px; height: 28px;
  transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg) scale(1.4);
}
.hero .vite {
  z-index: 0; top: 107px; height: 26px; width: auto;
  transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg) scale(0.8);
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;
  min-height: 100vh;
}
@media (max-width: 1024px) { #center { padding: 32px 20px 24px; gap: 18px; } }

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;
  background: white;
}
#next-steps > div { flex: 1 1 0; padding: 32px; }
@media (max-width: 1024px) { #next-steps > div { padding: 24px 20px; } }
.icon { margin-bottom: 16px; width: 22px; height: 22px; }
@media (max-width: 1024px) { #next-steps { flex-direction: column; text-align: center; } }

#docs { border-right: 1px solid var(--border); }
@media (max-width: 1024px) { #docs { border-right: none; border-bottom: 1px solid var(--border); } }

#next-steps ul {
  list-style: none; padding: 0; display: flex; gap: 8px; margin: 32px 0 0;
}
#next-steps ul .logo { height: 18px; }
#next-steps ul a {
  color: var(--text-h); font-size: 16px; border-radius: 6px; background: var(--social-bg);
  display: flex; padding: 6px 12px; align-items: center; gap: 8px; text-decoration: none;
  transition: box-shadow 0.3s;
}
#next-steps ul a:hover { box-shadow: var(--shadow); }
#next-steps ul a .button-icon { height: 18px; width: 18px; }

@media (max-width: 1024px) {
  #next-steps ul { margin-top: 20px; flex-wrap: wrap; justify-content: center; }
  #next-steps ul li { flex: 1 1 calc(50% - 8px); }
  #next-steps ul a { width: 100%; justify-content: center; box-sizing: border-box; }
}

#spacer { height: 88px; border-top: 1px solid var(--border); }
@media (max-width: 1024px) { #spacer { height: 48px; } }

.ticks {
  position: relative; width: 100%;
}
.ticks::before, .ticks::after {
  content: ''; position: absolute; top: -4.5px; border: 5px solid transparent;
}
.ticks::before { left: 0; border-left-color: var(--border); }
.ticks::after { right: 0; border-right-color: var(--border); }

/* --- SAAS DASHBOARD & AUTH OVERLAYS --- */
.app-container { width: 100vw; height: 100vh; position: relative; }

.auth-container {
  width: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  z-index: 10;
}

.auth-card h2 { margin-top: 0; color: var(--dark); font-weight: 800; letter-spacing: -0.025em; }
.auth-card input {
  width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid var(--border); border-radius: 0.5rem; box-sizing: border-box;
}

.auth-card button {
  width: 100%; padding: 0.8rem; background: var(--primary); color: white; border: none; border-radius: 0.5rem; font-weight: bold; cursor: pointer; margin-top: 1rem;
}

.guest-btn { background: #64748b !important; }
.auth-card p { margin-top: 1.5rem; font-size: 0.9rem; color: var(--secondary); cursor: pointer; }
.error { color: #ef4444; font-size: 0.85rem; }

.floating-bar {
  position: fixed; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 1000;
  background: var(--glass); backdrop-filter: blur(10px); padding: 0.6rem 1.5rem;
  border-radius: 2rem; display: flex; align-items: center; gap: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.3); font-weight: 500;
}

.portal-toggle { position: fixed; bottom: 2rem; right: 2rem; z-index: 1000; }
.portal-toggle button {
  background: var(--dark); color: white; padding: 1rem 1.5rem; border-radius: 3rem; border: none; font-weight: bold; cursor: pointer;
}

.lang-selector {
  position: fixed; top: 5rem; right: 1.5rem; z-index: 1000; display: flex; flex-direction: column; gap: 0.5rem;
}
.lang-selector button {
  background: white; border: 2px solid transparent; width: 45px; height: 45px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; transition: all 0.2s;
}
.lang-selector button.active { border-color: var(--primary); transform: scale(1.1); }

.admin-portal { background: #f8fafc; min-height: 100vh; padding: 6rem 2rem 2rem; box-sizing: border-box; }
.admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1400px; margin: 0 auto; }
.admin-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: var(--shadow); }
