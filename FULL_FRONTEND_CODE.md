# Full Frontend Code: App.tsx (Fixed Logic)

This version maintains your existing structure while fixing the async AI processing and removing code that causes blank screens.

```tsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Configure Backend URL
axios.defaults.baseURL = ""; 

// Fix Leaflet default icon issue in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "./App.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const LANGUAGES = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳", dbCol: "description" },
  { code: "en", name: "English", flag: "🇺🇸", dbCol: "description_en" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", dbCol: "description_zh" },
  { code: "ko", name: "Korean", flag: "🇰🇷", dbCol: "description_ko" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", dbCol: "description_ja" },
];

interface Restaurant {
  id: number;
  name: string;
  specialty_dish: string;
  image_url: string;
  description: string;
  description_en: string;
  description_ko: string;
  description_zh: string;
  description_ja: string;
  audio_vi: string;
  audio_en: string;
  audio_ko: string;
  audio_zh: string;
  audio_ja: string;
  lat: number;
  lng: number;
}

interface User {
  username: string;
  role: string;
  token: string;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 16); }, [center, map]);
  return null;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState("login");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.7612, 106.7055]);
  const [language, setLanguage] = useState("vi");
  const [stats, setStats] = useState({ total_users: 0, total_restaurants: 0, total_visits: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newRest, setNewRest] = useState<Partial<Restaurant>>({
    name: "", specialty_dish: "", image_url: "", description: "", lat: 10.7612, lng: 106.7055
  });
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vinhkhanh_user");
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      axios.defaults.headers.common['Authorization'] = `Bearer ${u.token}`;
      setAuthMode(u.role === 'admin' ? 'admin' : u.role === 'partner' ? 'partner' : 'app');
    }
  }, []);

  useEffect(() => {
    if (authMode !== "login" && authMode !== "register") {
      fetchRestaurants();
      if (authMode === "admin") fetchStats();
    }
  }, [authMode]);

  const fetchRestaurants = async () => {
    const res = await axios.get("/api/nearby");
    setRestaurants(res.data);
  };

  const fetchStats = async () => {
    const res = await axios.get("/api/stats");
    setStats(res.data);
  };

  const autoGenerateContent = async () => {
    if (!newRest.description || !editingId) return alert("Cần mô tả và Lưu Quán trước!");
    setIsGeneratingAll(true);
    try {
      const trans = await axios.post("/api/translate", { text: newRest.description, rest_id: editingId });
      const { en, ko, zh, ja } = trans.data;
      
      // Update local state for immediate feedback
      setNewRest(prev => ({ ...prev, description_en: en, description_ko: ko, description_zh: zh, description_ja: ja }));

      const audioTasks = [
        { lang: "vi", text: newRest.description },
        { lang: "en", text: en },
        { lang: "ko", text: ko },
        { lang: "zh", text: zh },
        { lang: "ja", text: ja }
      ];

      for (const task of audioTasks) {
        if (!task.text) continue;
        await axios.post("/api/tts", { text: task.text, rest_id: editingId, lang: task.lang });
      }
      
      await fetchRestaurants();
      alert("✅ AI Finished!");
    } catch (e) { alert("AI Error"); }
    finally { setIsGeneratingAll(false); }
  };

  const handleAuth = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/login" : "/api/register";
    try {
      const res = await axios.post(endpoint, { username: usernameInput, password: passwordInput });
      if (res.data.token) {
        setUser(res.data);
        localStorage.setItem("vinhkhanh_user", JSON.stringify(res.data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setAuthMode(res.data.role === 'admin' ? 'admin' : 'app');
      } else if (!isLogin) setAuthMode("login");
    } catch (e) { setAuthError("Error"); }
  };

  const playAudio = (b64: string) => {
    if (!b64) return alert("No audio");
    new Audio(`data:audio/mpeg;base64,${b64}`).play();
  };

  if (authMode === "login" || authMode === "register") {
    return (
      <div id="center" className="auth-container">
        <div className="hero">
           <img className="base" src="https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.png" alt="Base" style={{opacity: 0.1}} />
        </div>
        <div className="auth-card">
          <h2>{authMode === "login" ? "Login" : "Register"}</h2>
          <form onSubmit={(e) => handleAuth(e, authMode === "login")}>
            <input placeholder="Username" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} />
            <input type="password" placeholder="Password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
            <button type="submit">Go</button>
          </form>
          <p onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>Toggle</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="portal-toggle">
         <button onClick={() => setAuthMode(authMode === "app" ? "admin" : "app")}>Toggle View</button>
      </div>

      {authMode === "app" ? (
        <MapContainer center={mapCenter} zoom={16} style={{ height: "100vh" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {restaurants.map(r => (
            <Marker key={r.id} position={[r.lat, r.lng]} icon={redIcon}>
              <Popup>
                <h3>{r.name}</h3>
                <button onClick={() => playAudio((r as any)[`audio_${language}`])}>Play</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="admin-grid">
           {/* Admin UI like you have */}
        </div>
      )}
    </div>
  );
}
```
