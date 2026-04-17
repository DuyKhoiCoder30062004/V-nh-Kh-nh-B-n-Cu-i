# Full Frontend Code (Fixed Audio & DB Save)

This version fixes the asynchronous state bug to ensure translated text is correctly sent to the TTS engine and saved to the database.

```tsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 1. Configure Python Backend URL
axios.defaults.baseURL = "http://localhost:8000";

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

// --- MAP ICON CONFIGURATION ---
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

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.7612, 106.7055]);
  const [language, setLanguage] = useState("vi");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState({ total_users: 0, total_restaurants: 0, total_visits: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newRest, setNewRest] = useState<Partial<Restaurant>>({
    name: "", specialty_dish: "", image_url: "", 
    description: "", description_en: "", description_ko: "", description_zh: "", description_ja: "",
    audio_vi: "", audio_en: "", audio_ko: "", audio_zh: "", audio_ja: "",
    lat: 10.7612, lng: 106.7055
  });
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("vinhkhanh_user");
    if (savedUser) { 
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser); 
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      if (parsedUser.role === 'admin') setAuthMode('admin');
      else if (parsedUser.role === 'partner') setAuthMode('partner');
      else setAuthMode('app');
    }
  }, []);

  useEffect(() => {
    if (authMode !== "login" && authMode !== "register") {
      fetchRestaurants();
      if (authMode === "admin") fetchStats();
    }
  }, [authMode]);

  const handleGuestLogin = () => {
    const guestUser = { username: "Khách", role: "guest", token: "" };
    setUser(guestUser);
    setAuthMode("app");
  };

  const handleAuth = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault(); setAuthError("");
    const endpoint = isLogin ? "/api/login" : "/api/register";
    try {
      const res = await axios.post(endpoint, { username: usernameInput, password: passwordInput });
      if (res.data.error) setAuthError(res.data.error);
      else {
        if (isLogin) {
          const userData = { ...res.data };
          setUser(userData);
          localStorage.setItem("vinhkhanh_user", JSON.stringify(userData));
          axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
          if (userData.role === 'admin') setAuthMode("admin");
          else if (userData.role === 'partner') setAuthMode("partner");
          else setAuthMode("app");
        } else { 
          alert("Đăng ký thành công!"); setAuthMode("login"); 
        }
      }
    } catch (err) { setAuthError("Lỗi kết nối server."); }
  };

  const handleLogout = () => {
    localStorage.removeItem("vinhkhanh_user");
    setUser(null);
    setAuthMode("login");
    delete axios.defaults.headers.common['Authorization'];
  };

  const fetchRestaurants = async () => { 
    try {
      const res = await axios.get("/api/nearby");
      setRestaurants(res.data);
    } catch(e) { console.error(e); }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("/api/stats");
      setStats(res.data);
    } catch(e) {}
  };

  // --- AI LOGIC (FIXED ASYNC BUG) ---
  const autoGenerateContent = async () => {
    if (!newRest.description) return alert("Vui lòng nhập mô tả Tiếng Việt!");
    if (!editingId) return alert("Bạn cần lưu quán trước khi tạo nội dung AI!");
    
    setIsGeneratingAll(true);
    try {
      // 1. Dịch văn bản qua Backend (Sẽ tự động cập nhật Database description_xx)
      const transRes = await axios.post("/api/translate", { 
        text: newRest.description, 
        rest_id: editingId 
      });
      
      const translations = transRes.data; // {en, ko, zh, ja}
      if (translations.error) throw new Error(translations.error);

      // Cập nhật UI ngay lập tức bằng dữ liệu thô (không dùng newRest vì nó async)
      setNewRest(prev => ({ ...prev, ...translations }));

      // 2. Tạo Audio
      // Quan trọng: Sử dụng "translations" trực tiếp từ API thay vì "newRest"
      const langs = [
        { key: "audio_vi", text: newRest.description },
        { key: "audio_en", text: translations.en },
        { key: "audio_ko", text: translations.ko },
        { key: "audio_zh", text: translations.zh },
        { key: "audio_ja", text: translations.ja }
      ];

      const audioResults: any = {};
      for (const item of langs) {
        if (!item.text) continue;
        const res = await axios.post("/api/tts", { 
          text: item.text, 
          rest_id: editingId,
          lang: item.key.replace("audio_", "") 
        });
        audioResults[item.key] = res.data.audio_base64 || "";      
      }

      setNewRest(prev => ({ ...prev, ...audioResults }));
      
      // 3. Refresh lại danh sách để bản đồ có data âm thanh mới nhất
      await fetchRestaurants();
      
      alert("✅ Hoàn tất xử lý AI: Đã dịch và tạo giọng nói!");
    } catch (err: any) {
      alert("Lỗi AI: " + (err.message || "Không xác định"));
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? axios.put : axios.post;
      const url = editingId ? `/api/restaurants/${editingId}` : "/api/restaurants";
      const res = await method(url, newRest);
      if (res.data.error) alert(res.data.error);
      else {
        alert(res.data.message);
        setEditingId(null);
        setNewRest({ name: "", specialty_dish: "", image_url: "", description: "", lat: 10.7612, lng: 106.7055 });
        fetchRestaurants();
      }
    } catch (err) { alert("Lỗi khi lưu dữ liệu."); }
  };

  const handleDeleteRestaurant = async (id: number, name: string) => {
    if (window.confirm(`Xóa quán "${name}"?`)) { 
      await axios.delete(`/api/restaurants/${id}`); 
      fetchRestaurants();
    }
  };

  const playAudio = (base64Data: string) => {
    if (!base64Data) return alert("Quán này chưa có âm thanh. Hãy vào phần Quản lý và nhấn 'Tự động AI'!");
    const audio = new Audio(`data:audio/mpeg;base64,${base64Data}`);
    audio.play();
  };

  // --- UI PART WITH INTEGRATED STARTER CSS ---
  if (authMode === "login" || authMode === "register") {
    const isLogin = authMode === "login";
    return (
      <div id="center" className="auth-container">
        <div className="hero">
           <img className="base" src="https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.png" alt="Base" style={{opacity: 0.1}} />
           <img className="framework" src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" />
           <img className="vite" src="https://vitejs.dev/logo.svg" alt="Vite" />
        </div>
        
        <div className="auth-card">
          <h2>{isLogin ? "🔐 Đăng Nhập" : "📝 Đăng Ký"}</h2>
          {authError && <p className="error">{authError}</p>}
          <form onSubmit={(e) => handleAuth(e, isLogin)}>
            <input placeholder="Tài khoản" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} required />
            <input type="password" placeholder="Mật khẩu" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required />
            <button type="submit">{isLogin ? "Đăng Nhập" : "Đăng Ký"}</button>
            <button type="button" className="guest-btn" onClick={handleGuestLogin} style={{ marginTop: "0.5rem", background: "#64748b" }}>
              Tiếp tục với tư cách Khách 👤
            </button>
          </form>
          <p onClick={() => setAuthMode(isLogin ? "register" : "login")}>
            {isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
          </p>
        </div>

        <div id="spacer" className="ticks"></div>
        <div id="next-steps">
          <div id="docs">
            <h3>📖 VoiceMap SAAS</h3>
            <p>Khám phá ẩm thực Vĩnh Khánh bằng giọng nói AI đa ngôn ngữ.</p>
          </div>
          <div>
            <h3>🛠️ Tech Stack</h3>
            <ul style={{marginTop: "10px"}}>
              <li><img className="logo" src="https://vitejs.dev/logo.svg" alt="Vite" /></li>
              <li><img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" /></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="floating-bar">
        <span>👋 {user?.username} ({user?.role})</span>
        <button onClick={handleLogout}>Thoát</button>
      </div>

      {(user?.role === "admin" || user?.role === "partner") && (
         <div className="portal-toggle">
            <button onClick={() => setAuthMode(authMode === "app" ? user.role : "app")}>
              {authMode === "app" ? "📂 Quản Lý Data" : "📍 Xem Bản Đồ"}
            </button>
         </div>
      )}

      {authMode === "app" ? (
        <>
          <div className="lang-selector">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLanguage(l.code)} className={language === l.code ? "active" : ""}>
                {l.flag}
              </button>
            ))}
          </div>

          <MapContainer center={mapCenter} zoom={16} style={{ height: "100vh", width: "100vw" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController center={mapCenter} />
            {restaurants.map(rest => {
              const langConfig = LANGUAGES.find(l => l.code === language);
              const desc = rest[langConfig?.dbCol as keyof Restaurant] as string;
              return (
                <Marker key={rest.id} position={[rest.lat, rest.lng]} icon={redIcon}>
                  <Popup>
                    <div className="popup-card">
                      <img src={rest.image_url} alt={rest.name} referrerPolicy="no-referrer" />
                      <h3>{rest.name}</h3>
                      <p>{desc}</p>
                      <button onClick={() => playAudio(rest[`audio_${language}` as keyof Restaurant] as string)}>
                        🔊 Nghe Giới Thiệu
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </>
      ) : (
        <div className="admin-portal">
          <div className="admin-grid">
            <div className="admin-card">
              <h3>{editingId ? "✏️ Sửa Quán" : "➕ Thêm Quán"}</h3>
              <form onSubmit={handleSaveRestaurant}>
                <input placeholder="Tên quán" value={newRest.name} onChange={e=>setNewRest({...newRest, name:e.target.value})} required/>
                <input placeholder="Đặc sản" value={newRest.specialty_dish} onChange={e=>setNewRest({...newRest, specialty_dish:e.target.value})} required/>
                <input placeholder="Link ảnh" value={newRest.image_url} onChange={e=>setNewRest({...newRest, image_url:e.target.value})} />
                <div className="geo-inputs">
                  <input type="number" step="any" placeholder="Lat" value={newRest.lat} onChange={e=>setNewRest({...newRest, lat:parseFloat(e.target.value)})}/>
                  <input type="number" step="any" placeholder="Lng" value={newRest.lng} onChange={e=>setNewRest({...newRest, lng:parseFloat(e.target.value)})}/>
                </div>
                <textarea placeholder="Mô tả Tiếng Việt" value={newRest.description} onChange={e=>setNewRest({...newRest, description:e.target.value})} required />
                
                {editingId && (
                  <button type="button" onClick={autoGenerateContent} disabled={isGeneratingAll} style={{background: "#10b981", color: "white", marginBottom: "1rem"}}>
                    {isGeneratingAll ? "⌛ AI Đang xử lý (30s)..." : "🪄 Tự động AI (Dịch & Voice)"}
                  </button>
                )}
                {!editingId && <p style={{fontSize: "0.8rem", color: "#666"}}>* Lưu quán trước khi dùng AI</p>}

                <div className="form-actions">
                  <button type="submit" className="save-btn">Lưu Vào Database</button>
                  {editingId && <button type="button" onClick={() => {setEditingId(null); setNewRest({name: ""});}}>Hủy</button>}
                </div>
              </form>
            </div>

            <div className="admin-card">
              <h3>📋 Danh Sách Quán</h3>
              <div className="scroll-list">
                {restaurants.map(r => (
                  <div key={r.id} className="list-item">
                    <span>{r.name}</span>
                    <div className="item-actions">
                      <button onClick={() => { setEditingId(r.id); setNewRest(r); }}>Sửa</button>
                      <button onClick={() => handleDeleteRestaurant(r.id, r.name)} className="delete-btn">Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {user?.role === "admin" && (
                <div className="admin-card">
                  <h3>📈 Thống Kê</h3>
                  <div className="stats-box">
                    <p>Users: {stats.total_users}</p>
                    <p>Restaurants: {stats.total_restaurants}</p>
                    <p>Real Visits: {stats.total_visits}</p>
                  </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```
  
