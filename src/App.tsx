import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

import { GoogleGenAI, Modality } from "@google/genai";
import "./App.css";

// --- CẤU HÌNH BIỂU TƯỢNG BẢN ĐỒ ---
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
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
  id: number;
  username: string;
  role: string;
  token?: string;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 16); }, [center, map]);
  return null;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  // --- STATE TÀI KHOẢN ---
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState("login");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // --- STATE BẢN ĐỒ & ỨNG DỤNG ---
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.7612, 106.7055]);
  const [language, setLanguage] = useState("vi");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  
  // --- STATE ADMIN MỚI ---
  const [stats, setStats] = useState({ total_users: 0, total_restaurants: 0, total_visits: 0, pending_requests: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newRest, setNewRest] = useState({
    name: "", specialty_dish: "", image_url: "", 
    description: "", description_en: "", description_ko: "", description_zh: "", description_ja: "",
    audio_vi: "", audio_en: "", audio_ko: "", audio_zh: "", audio_ja: "",
    lat: 10.7612, lng: 106.7055
  });
  // --- THÊM STATE CHO QUẢN LÝ USER ---
  const [adminTab, setAdminTab] = useState("restaurants"); // 'restaurants', 'users', 'requests'
  const [usersList, setUsersList] = useState<User[]>([]);
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newUserForm, setNewUserForm] = useState({ username: "", password: "", role: "app" });
  const [adminTestLang, setAdminTestLang] = useState("vi");

 
  // --- STATE ÂM THANH ---
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);


  // --- 1. KIỂM TRA ĐĂNG NHẬP KHI MỞ WEB ---
  useEffect(() => {
    const savedUser = localStorage.getItem("vinhkhanh_user");
    if (savedUser) { 
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser); 
      if (parsedUser.role === 'admin') setAuthMode('admin');
      else if (parsedUser.role === 'partner') setAuthMode('partner');
      else setAuthMode('app');
    }
  }, []);

  // --- 2. LẤY DỮ LIỆU & GPS ---
  useEffect(() => {
    if (authMode === "app" || authMode === "admin" || authMode === "partner") {
      fetchRestaurants();
      if (authMode === "admin") {
        fetchStats();
        fetchUsers();
        fetchRequests();
      }
      if (authMode === "partner") {
        fetchRequests();
      }
      if ("geolocation" in navigator && !userLocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => { 
            const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            setUserLocation(loc); 
            setMapCenter(loc); 
          },
          () => {}
        );
      }
    }
  }, [authMode]);

  // --- 3. XỬ LÝ TÀI KHOẢN ---
  const handleAuth = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault(); setAuthError("");
    const endpoint = isLogin ? "/api/login" : "/api/register";
    try {
      const res = await axios.post(endpoint, { username: usernameInput, password: passwordInput });
      if (res.data.error) setAuthError(res.data.error);
      else {
        if (isLogin) {
          const userData: User = { id: res.data.id, username: res.data.username, role: res.data.role, token: res.data.token };
          setUser(userData); 
          localStorage.setItem("vinhkhanh_user", JSON.stringify(userData)); 
          if (userData.role === 'admin') setAuthMode("admin");
          else if (userData.role === 'partner') setAuthMode("partner");
          else setAuthMode("app");
        } else { alert("Đăng ký thành công!"); setAuthMode("login"); }
      }
    } catch (err) { setAuthError("Lỗi kết nối."); }
  };
  const handleLogout = () => { localStorage.removeItem("vinhkhanh_user"); setUser(null); setAuthMode("login"); setUsernameInput(""); setPasswordInput(""); };

  // --- 4. DATA FETCHING ---
  const fetchRestaurants = async () => { 
    try {
      let url = "/api/nearby";
      if (user?.role === 'partner') url += `?ownerId=${user.id}`;
      const res = await axios.get(url); 
      setRestaurants(Array.isArray(res.data) ? res.data : []); 
    } catch(e) {
      setRestaurants([]);
    }
  };
  const fetchStats = async () => { try { const res = await axios.get("/api/stats"); setStats(res.data); } catch(e){} };
  const fetchUsers = async () => { try { const res = await axios.get("/api/users"); setUsersList(Array.isArray(res.data) ? res.data : []); } catch(e){} };
  const fetchRequests = async () => { 
    try { 
      const res = await axios.get("/api/requests", {
        headers: { Authorization: `Bearer ${user?.token}` }
      }); 
      setRequestsList(Array.isArray(res.data) ? res.data : []); 
    } catch(e){
      setRequestsList([]);
    } 
  };

  
  // --- 5. HÀM MA THUẬT AI (Sử dụng Gemini API trực tiếp từ Frontend) ---
  const autoGenerateContent = async () => {
    if (!newRest.description) return alert("Vui lòng nhập Kịch bản Tiếng Việt trước!");
    setIsGeneratingAll(true);
    
    try {
      // 1. Dịch văn bản bằng Gemini
      console.log("Đang dịch văn bản...");
      const translatePrompt = `Translate the following Vietnamese text into English, Chinese, Korean, and Japanese. Return ONLY a JSON object with keys 'en', 'zh', 'ko', 'ja'.
      Text: ${newRest.description}`;
      
      const transRes = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: translatePrompt,
        config: { responseMimeType: "application/json" }
      });
      
      const translations = JSON.parse(transRes.text || "{}");
      const { en, zh, ko, ja } = translations;

      if (!en || !zh || !ko || !ja) throw new Error("Không nhận được bản dịch đầy đủ từ AI.");

      // Cập nhật text trước để người dùng thấy
      setNewRest(prev => ({ ...prev, description_en: en, description_ko: ko, description_zh: zh, description_ja: ja }));

      const generateTTS = async (text: string, lang: string, voice: string) => {
        console.log(`Đang tạo Audio [${lang}]...`);
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say in ${lang}: ${text}` }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                  },
              },
            },
          });
          const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          return audioData || "";
        } catch (e) {
          console.error(`Lỗi TTS [${lang}]:`, e);
          return "";
        }
      };

      // 2. Tạo Audio bằng Gemini TTS (Chạy tuần tự và gán trực tiếp để tránh mất dữ liệu)
      const audio_vi = await generateTTS(newRest.description, "Vietnamese", "Kore");
      const audio_en = await generateTTS(en, "English", "Charon");
      const audio_zh = await generateTTS(zh, "Chinese", "Zephyr");
      const audio_ko = await generateTTS(ko, "Korean", "Fenrir");
      const audio_ja = await generateTTS(ja, "Japanese", "Puck");

      setNewRest(prev => ({ 
        ...prev, 
        description_en: en, description_ko: ko, description_zh: zh, description_ja: ja,
        audio_vi, audio_en, audio_zh, audio_ko, audio_ja 
      }));

      alert("✅ Hoàn tất! Đã dịch và tạo thành công Audio bằng Gemini AI.");
    } catch (err: any) { 
      console.error("AI Error:", err);
      alert("Lỗi từ Gemini: " + err.message); 
    } finally { 
      setIsGeneratingAll(false); 
    }
  };

  // --- 6. QUẢN LÝ QUÁN (CRUD) ---
  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isPartner = user?.role === 'partner';
      const endpoint = isPartner ? "/api/requests" : (editingId ? `/api/restaurants/${editingId}` : "/api/restaurants");
      const method = (editingId && !isPartner) ? axios.put : axios.post;
      
      const res = await method(endpoint, newRest, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      if (res.data.error) alert("Lỗi: " + res.data.error);
      else {
        alert(res.data.message || (editingId ? "Đã cập nhật quán ăn!" : "Đã lưu quán mới!"));
        setEditingId(null);
        setNewRest({ name: "", specialty_dish: "", image_url: "", description: "", description_en: "", description_ko: "", description_zh: "", description_ja: "", audio_vi: "", audio_en: "", audio_ko: "", audio_zh: "", audio_ja: "", lat: 10.7612, lng: 106.7055 });
        fetchRestaurants(); fetchStats(); fetchRequests();
      }
    } catch (err: any) { alert(err.response?.data?.error || "Lỗi máy chủ!"); }
  };

  const handleEditClick = (rest: Restaurant) => {
    setEditingId(rest.id);
    setNewRest({
      name: rest.name, specialty_dish: rest.specialty_dish, image_url: rest.image_url,
      description: rest.description, description_en: rest.description_en, description_ko: rest.description_ko, description_zh: rest.description_zh, description_ja: rest.description_ja,
      audio_vi: rest.audio_vi || "", audio_en: rest.audio_en || "", audio_ko: rest.audio_ko || "", audio_zh: rest.audio_zh || "", audio_ja: rest.audio_ja || "",
      lat: rest.lat, lng: rest.lng
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRestaurant = async (id: number, name: string) => {
    if (window.confirm(`Xóa quán "${name}"?`)) { 
      await axios.delete(`/api/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      }); 
      fetchRestaurants(); fetchStats(); 
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingUserId ? `/api/users/${editingUserId}` : "/api/users";
      const method = editingUserId ? axios.put : axios.post;
      const res = await method(endpoint, newUserForm);
      
      if (res.data.error) alert("Lỗi: " + res.data.error);
      else {
        alert(editingUserId ? "Cập nhật User thành công!" : "Thêm User mới thành công!");
        setEditingUserId(null);
        setNewUserForm({ username: "", password: "", role: "app" });
        fetchUsers(); fetchStats();
      }
    } catch (err) { alert("Lỗi kết nối máy chủ!"); }
  };

  const handleApproveRequest = async (id: number) => {
    try {
      await axios.post(`/api/requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      alert("Đã duyệt thành công!");
      fetchRequests(); fetchRestaurants(); fetchStats();
    } catch(e){ alert("Lỗi khi duyệt."); }
  };

  const handleRejectRequest = async (id: number) => {
    if (window.confirm("Từ chối yêu cầu này?")) {
      try {
        await axios.post(`/api/requests/${id}/reject`, {}, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        fetchRequests(); fetchStats();
      } catch(e){ alert("Lỗi."); }
    }
  };

  const handleEditUserClick = (userItem: User) => {
    setEditingUserId(userItem.id);
    setNewUserForm({ username: userItem.username, password: "", role: userItem.role }); 
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa tài khoản "${username}"?`)) { 
      await axios.delete(`/api/users/${id}`); 
      fetchUsers(); fetchStats(); 
    }
  };

  // --- 7. XỬ LÝ ÂM THANH (PHÁT TỪ BASE64) ---
  const stopAudio = () => {
    if (audioSourceRef.current) { try { audioSourceRef.current.stop(); } catch(e){} audioSourceRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    setAudioUrl(null);
  };

  const playRawPCM = async (base64Data: string) => {
    try {
      if (!base64Data || base64Data.length < 50) return alert("File âm thanh chưa có sẵn!");
      stopAudio(); 
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioContext; if (audioContext.state === 'suspended') await audioContext.resume();
      const binaryString = atob(base64Data); const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const int16Array = new Int16Array(bytes.buffer); const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) float32Array[i] = int16Array[i] / 32768;
      const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000); audioBuffer.getChannelData(0).set(float32Array);
      const source = audioContext.createBufferSource(); source.buffer = audioBuffer; source.connect(audioContext.destination);
      source.onended = () => setAudioUrl(null); audioSourceRef.current = source; source.start();
      setAudioUrl("playing");
    } catch (err) { console.error(err); alert("Lỗi khi giải mã âm thanh."); }
  };

  const handlePlayAudioForUser = (restaurant: Restaurant) => {
    const langObj = LANGUAGES.find(l => l.code === language);
    const audioKey = `audio_${language}` as keyof Restaurant;
    const audioData = restaurant[audioKey] as string;
    if (audioData) playRawPCM(audioData);
    else alert("Xin lỗi, Audio cho ngôn ngữ này đang được cập nhật!");
  };

  // ==========================================
  // GIAO DIỆN 1: ĐĂNG NHẬP
  // ==========================================
  if (authMode === "login" || authMode === "register") {
    const isLogin = authMode === "login";
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0f2f1'}}>
        <div style={{...styles.card, padding: '30px', width: '100%', maxWidth: '400px'}}>
          <h2 style={{textAlign: 'center', color: '#009688'}}> {isLogin ? "🔐 Đăng Nhập Bản Đồ" : "📝 Đăng Ký Tài Khoản"} </h2>
          {authError && <div style={{color: 'red', background: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '15px'}}>{authError}</div>}
          <form onSubmit={(e) => handleAuth(e, isLogin)}>
            <div style={{marginBottom: '15px'}}><label style={styles.label}>Tài khoản:</label><input required value={usernameInput} onChange={e => setUsernameInput(e.target.value)} style={styles.input} /></div>
            <div style={{marginBottom: '20px'}}><label style={styles.label}>Mật khẩu:</label><input type="password" required value={passwordInput} onChange={e => setPasswordInput(e.target.value)} style={styles.input} /></div>
            <button type="submit" style={styles.primaryBtn}>{isLogin ? "Vào Bản Đồ" : "Tạo Tài Khoản"}</button>
          </form>
          <div style={{textAlign: 'center', marginTop: '20px', fontSize: '14px'}}>
            <span onClick={() => { setAuthMode(isLogin ? "register" : "login"); setAuthError(""); }} style={{color: '#009688', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline'}}>{isLogin ? "Đăng ký ngay" : "Đăng nhập lại"}</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN 2.5: MERCHANT PORTAL (DÀNH CHO ĐỐI TÁC)
  // ==========================================
  if (authMode === "partner" && user?.role === "partner") {
    const myRest = restaurants[0]; // Partner chỉ có 1 quán (theo logic lọc ở fetch)

    return (
      <div style={{fontFamily: 'Arial', background: '#f0f4f8', minHeight: '100vh', padding: '20px'}}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
            <div>
              <h2 style={{color: '#00695c', margin: 0}}>🏪 Cổng Thông Tin Đối Tác</h2>
              <p style={{margin: '5px 0 0 0', color: '#666'}}>Chào mừng, <strong>{user.username}</strong></p>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => setAuthMode("app")} style={{padding: '10px 20px', background: '#009688', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>📍 Xem Bản Đồ</button>
              <button onClick={handleLogout} style={{padding: '10px 20px', background: 'white', color: '#f44336', border: '1px solid #f44336', borderRadius: '8px', cursor: 'pointer'}}>Thoát</button>
            </div>
          </div>

          {!myRest && !editingId ? (
            <div style={{...styles.card, padding: '40px', textAlign: 'center'}}>
              <div style={{fontSize: '50px', marginBottom: '20px'}}>🍽️</div>
              <h3>Bạn chưa có quán ăn nào trên hệ thống!</h3>
              <p>Vui lòng nhấn nút bên dưới để bắt đầu tạo hồ sơ quán của bạn.</p>
              <button 
                onClick={() => setEditingId(-1)} 
                style={{...styles.primaryBtn, maxWidth: '250px', margin: '20px auto'}}
              >
                ➕ Tạo Quán Ăn Ngay
              </button>
            </div>
          ) : (
            <>
              {/* FORM CHỈNH SỬA DUY NHẤT 1 QUÁN */}
              <div style={{...styles.card, padding: '25px', marginBottom: '30px', borderTop: '5px solid #009688'}}>
                <h3 style={{marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                  {myRest ? `📝 Quản Lý: ${myRest.name}` : "➕ Tạo Hồ Sơ Quán Ăn"}
                </h3>
                
                <form onSubmit={handleSaveRestaurant}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                    <div style={{gridColumn: '1 / -1'}}>
                      <label style={styles.label}>Tên quán ăn của bạn (*)</label>
                      <input required value={newRest.name} onChange={e=>setNewRest({...newRest, name: e.target.value})} style={styles.input} placeholder="Ví dụ: Ốc Đào Vĩnh Khánh" />
                    </div>
                    <div>
                      <label style={styles.label}>Món đặc sản (*)</label>
                      <input required value={newRest.specialty_dish} onChange={e=>setNewRest({...newRest, specialty_dish: e.target.value})} style={styles.input} placeholder="Ví dụ: Ốc hương trứng muối" />
                    </div>
                    <div>
                      <label style={styles.label}>Link Hình Ảnh</label>
                      <input value={newRest.image_url} onChange={e=>setNewRest({...newRest, image_url: e.target.value})} style={styles.input} placeholder="Dán link ảnh tại đây..." />
                    </div>
                    
                    {/* KHU VỰC AI VOICE - TRỌNG TÂM CỦA PARTNER */}
                    <div style={{gridColumn: '1 / -1', background: '#e0f2f1', padding: '20px', borderRadius: '12px', border: '1px solid #b2dfdb'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                        <label style={{...styles.label, color: '#00796b', margin: 0}}>🎙️ Kịch bản giới thiệu & AI Voice (*)</label>
                        <span style={{fontSize: '12px', color: '#00796b', background: '#b2dfdb', padding: '2px 8px', borderRadius: '10px'}}>Powered by Gemini AI</span>
                      </div>
                      <textarea 
                        required 
                        rows={4} 
                        value={newRest.description} 
                        onChange={e=>setNewRest({...newRest, description: e.target.value})} 
                        style={{...styles.input, fontSize: '15px'}} 
                        placeholder="Hãy nhập lời chào khách bằng tiếng Việt. AI sẽ tự động dịch sang 4 ngôn ngữ khác và tạo giọng đọc cho bạn!" 
                      />
                      
                      <div style={{marginTop: '15px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap'}}>
                        <button 
                          type="button" 
                          onClick={autoGenerateContent} 
                          disabled={isGeneratingAll} 
                          style={{
                            background: '#00796b', 
                            color: 'white', 
                            padding: '12px 25px', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,121,107,0.3)',
                            flex: '2 1 200px'
                          }}
                        >
                          {isGeneratingAll ? "⏳ AI Đang Dịch & Tạo Giọng..." : "🪄 Kích Hoạt AI Ma Thuật"}
                        </button>
                        
                        <div style={{display: 'flex', gap: '8px', flex: '1 1 200px'}}>
                          <select 
                            value={adminTestLang} 
                            onChange={(e) => setAdminTestLang(e.target.value)}
                            style={{padding: '10px', borderRadius: '8px', border: '1px solid #b2dfdb', flex: 1}}
                          >
                            {LANGUAGES.map(l => (
                              <option key={l.code} value={l.code}>{l.flag} Nghe thử: {l.name}</option>
                            ))}
                          </select>
                          <button 
                            type="button" 
                            onClick={() => {
                              const audioKey = `audio_${adminTestLang}` as keyof typeof newRest;
                              const audioData = newRest[audioKey] as string;
                              if (audioData) playRawPCM(audioData);
                              else alert("Vui lòng nhấn nút 'Kích Hoạt AI' trước để tạo âm thanh!");
                            }} 
                            style={{
                              background: '#ff9800', 
                              color: 'white', 
                              border: 'none', 
                              padding: '10px 15px', 
                              borderRadius: '8px', 
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            ▶️ Phát
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* HIỂN THỊ TRẠNG THÁI CÁC NGÔN NGỮ */}
                    <div style={{gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px'}}>
                      {LANGUAGES.map(l => {
                        const hasAudio = (newRest as any)[`audio_${l.code}`];
                        return (
                          <div key={l.code} style={{background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center'}}>
                            <div style={{fontSize: '20px'}}>{l.flag}</div>
                            <div style={{fontSize: '12px', fontWeight: 'bold'}}>{l.name}</div>
                            <div style={{fontSize: '10px', color: hasAudio ? '#4CAF50' : '#f44336'}}>
                              {hasAudio ? "● Đã sẵn sàng" : "○ Chưa có audio"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{marginTop: '30px', display: 'flex', gap: '15px'}}>
                    <button type="submit" style={{...styles.primaryBtn, flex: 2, height: '50px', fontSize: '16px'}}>
                      💾 Cập Nhật Thông Tin Lên Bản Đồ
                    </button>
                    {myRest && (
                      <button 
                        type="button" 
                        onClick={() => handleEditClick(myRest)} 
                        style={{flex: 1, background: 'white', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer'}}
                      >
                        🔄 Hoàn tác
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* THÔNG TIN VỊ TRÍ (CHỈ ĐỌC) */}
              <div style={{...styles.card, padding: '20px', background: '#fff9c4', border: '1px solid #fbc02d'}}>
                <h4 style={{margin: '0 0 10px 0'}}>📍 Vị trí của bạn trên bản đồ</h4>
                <p style={{margin: 0, fontSize: '13px', color: '#7f6d00'}}>
                  Tọa độ hiện tại: <strong>{myRest?.lat}, {myRest?.lng}</strong>. 
                  <br/>* Để thay đổi vị trí chính xác, vui lòng liên hệ Admin để được hỗ trợ kỹ thuật.
                </p>
              </div>
              {/* TRẠNG THÁI YÊU CẦU */}
              <div style={{...styles.card, padding: '20px', marginBottom: '30px'}}>
                <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>📊 Trạng Thái Yêu Cầu Của Bạn</h3>
                {requestsList.length === 0 ? (
                  <p style={{fontSize: '13px', color: '#666'}}>Bạn chưa gửi yêu cầu nào.</p>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {requestsList.slice(0, 5).map(req => (
                      <div key={req.id} style={{display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f9f9f9', borderRadius: '5px'}}>
                        <span style={{fontSize: '13px'}}>{req.name} ({new Date(req.created_at).toLocaleDateString()})</span>
                        <span style={{
                          fontSize: '11px', 
                          fontWeight: 'bold', 
                          padding: '2px 8px', 
                          borderRadius: '10px',
                          background: req.status === 'approved' ? '#e8f5e9' : (req.status === 'pending' ? '#fff3e0' : '#ffebee'),
                          color: req.status === 'approved' ? '#2e7d32' : (req.status === 'pending' ? '#e65100' : '#c62828')
                        }}>
                          {req.status === 'approved' ? "Đã Duyệt" : (req.status === 'pending' ? "Chờ Duyệt" : "Từ Chối")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN 2: TRANG QUẢN TRỊ ADMIN (CMS)
  // ==========================================
  if (authMode === "admin" && user?.role === "admin") {
    return (
      <div style={{fontFamily: 'Arial', background: '#f5f5f5', minHeight: '100vh', padding: '20px', overflowY: 'auto'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          {/* HEADER ADMIN */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{color: '#d32f2f', margin: 0}}>⚙️ Hệ Thống Quản Trị (Admin Panel)</h2>
            <button onClick={() => setAuthMode("app")} style={{padding: '8px 15px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>⬅ Về Bản Đồ</button>
          </div>

          {/* THANH MENU TABS */}
          <div style={{display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #ddd', paddingBottom: '10px'}}>
            <button 
              onClick={() => setAdminTab("restaurants")} 
              style={adminTab === "restaurants" ? styles.adminTabActive : styles.adminTabInactive}
            >
              🍽️ Quản lý Quán Ăn
            </button>
            <button 
              onClick={() => setAdminTab("users")} 
              style={adminTab === "users" ? styles.adminTabActive : styles.adminTabInactive}
            >
              👥 Quản lý Người Dùng
            </button>
            <button 
              onClick={() => setAdminTab("requests")} 
              style={adminTab === "requests" ? styles.adminTabActive : styles.adminTabInactive}
            >
              ⏳ Chờ Duyệt {stats.pending_requests > 0 && <span style={{background: 'red', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '12px'}}>{stats.pending_requests}</span>}
            </button>
          </div>

          {adminTab === "restaurants" && (
            <>
              {/* THỐNG KÊ */}
              <div style={{display: 'flex', gap: '15px', marginBottom: '25px'}}>
                <div style={{...styles.statCard, borderLeft: '5px solid #2196F3'}}><div style={{fontSize: '24px', fontWeight: 'bold'}}>{stats.total_users}</div><div style={{fontSize: '13px', color: '#666'}}>👥 Khách hàng</div></div>
                <div style={{...styles.statCard, borderLeft: '5px solid #4CAF50'}}><div style={{fontSize: '24px', fontWeight: 'bold'}}>{stats.total_restaurants}</div><div style={{fontSize: '13px', color: '#666'}}>🍽️ Quán ăn</div></div>
                <div style={{...styles.statCard, borderLeft: '5px solid #ff9800'}}><div style={{fontSize: '24px', fontWeight: 'bold'}}>{stats.total_visits}</div><div style={{fontSize: '13px', color: '#666'}}>📈 Lượt quét QR</div></div>
                <div style={{...styles.statCard, borderLeft: '5px solid #f44336'}}><div style={{fontSize: '24px', fontWeight: 'bold'}}>{stats.pending_requests}</div><div style={{fontSize: '13px', color: '#666'}}>⏳ Chờ duyệt</div></div>
              </div>

              {/* FORM THÊM/SỬA QUÁN */}
              <div style={{...styles.card, padding: '20px', marginBottom: '30px', borderTop: editingId ? '4px solid #9c27b0' : '4px solid #4CAF50'}}>
                <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>{editingId ? "✏️ Chỉnh Sửa Quán Ăn" : "➕ Thêm Quán Ăn Mới"}</h3>
                <form onSubmit={handleSaveRestaurant}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                    <div><label style={styles.label}>Tên quán ăn (*)</label><input required value={newRest.name} onChange={e=>setNewRest({...newRest, name: e.target.value})} style={styles.input} /></div>
                    <div><label style={styles.label}>Món đặc sản (*)</label><input required value={newRest.specialty_dish} onChange={e=>setNewRest({...newRest, specialty_dish: e.target.value})} style={styles.input} /></div>
                    <div><label style={styles.label}>Vĩ độ (Latitude) (*)</label><input type="number" step="any" required value={newRest.lat} onChange={e=>setNewRest({...newRest, lat: parseFloat(e.target.value)})} style={styles.input} /></div>
                    <div><label style={styles.label}>Kinh độ (Longitude) (*)</label><input type="number" step="any" required value={newRest.lng} onChange={e=>setNewRest({...newRest, lng: parseFloat(e.target.value)})} style={styles.input} /></div>
                    <div style={{gridColumn: '1 / -1'}}><label style={styles.label}>Link Hình Ảnh (URL)</label><input value={newRest.image_url} onChange={e=>setNewRest({...newRest, image_url: e.target.value})} style={styles.input} /></div>
                    
                    {/* KHU VỰC AI */}
                    <div style={{gridColumn: '1 / -1', background: '#e3f2fd', padding: '15px', borderRadius: '8px'}}>
                      <label style={{...styles.label, color: '#1976d2'}}>🇻🇳 Kịch bản gốc (Tiếng Việt) (*)</label>
                      <textarea required rows={3} value={newRest.description} onChange={e=>setNewRest({...newRest, description: e.target.value})} style={styles.input} placeholder="Nhập giới thiệu bằng tiếng Việt để AI tự dịch..." />
                      <div style={{display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap'}}>
                        <button type="button" onClick={autoGenerateContent} disabled={isGeneratingAll} style={{background: '#1976d2', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', flex: '2 1 200px'}}>
                          {isGeneratingAll ? "⏳ AI Đang Xử Lý..." : "🪄 Tự động Dịch & Sinh Audio (Gemini AI)"}
                        </button>
                        <div style={{display: 'flex', gap: '5px', flex: '1 1 150px'}}>
                          <select 
                            value={adminTestLang} 
                            onChange={(e) => setAdminTestLang(e.target.value)}
                            style={{padding: '5px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '13px', flex: 1}}
                          >
                            {LANGUAGES.map(l => (
                              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                            ))}
                          </select>
                          <button 
                            type="button" 
                            onClick={() => {
                              const audioKey = `audio_${adminTestLang}` as keyof typeof newRest;
                              const audioData = newRest[audioKey] as string;
                              if (audioData) playRawPCM(audioData);
                              else alert("Chưa có audio cho ngôn ngữ này! Hãy nhấn nút AI để tạo.");
                            }} 
                            style={{...styles.playTestBtn, marginTop: 0, flex: 1}}
                          >
                            ▶️ Nghe Thử
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={styles.aiResultBox}>
                      <label style={styles.label}>🇺🇸 Kịch bản (English)</label>
                      <textarea rows={2} value={newRest.description_en} onChange={e=>setNewRest({...newRest, description_en: e.target.value})} style={styles.input} />
                      {newRest.audio_en ? <button type="button" onClick={() => playRawPCM(newRest.audio_en)} style={styles.playTestBtn}>▶️ Nghe Audio</button> : <span style={styles.missingBadge}>Thiếu Audio</span>}
                    </div>
                    <div style={styles.aiResultBox}>
                      <label style={styles.label}>🇨🇳 Kịch bản (Chinese)</label>
                      <textarea rows={2} value={newRest.description_zh} onChange={e=>setNewRest({...newRest, description_zh: e.target.value})} style={styles.input} />
                      {newRest.audio_zh ? <button type="button" onClick={() => playRawPCM(newRest.audio_zh)} style={styles.playTestBtn}>▶️ Nghe Audio</button> : <span style={styles.missingBadge}>Thiếu Audio</span>}
                    </div>
                    <div style={styles.aiResultBox}>
                      <label style={styles.label}>🇰🇷 Kịch bản (Korean)</label>
                      <textarea rows={2} value={newRest.description_ko} onChange={e=>setNewRest({...newRest, description_ko: e.target.value})} style={styles.input} />
                      {newRest.audio_ko ? <button type="button" onClick={() => playRawPCM(newRest.audio_ko)} style={styles.playTestBtn}>▶️ Nghe Audio</button> : <span style={styles.missingBadge}>Thiếu Audio</span>}
                    </div>
                    <div style={styles.aiResultBox}>
                      <label style={styles.label}>🇯🇵 Kịch bản (Japanese)</label>
                      <textarea rows={2} value={newRest.description_ja} onChange={e=>setNewRest({...newRest, description_ja: e.target.value})} style={styles.input} />
                      {newRest.audio_ja ? <button type="button" onClick={() => playRawPCM(newRest.audio_ja)} style={styles.playTestBtn}>▶️ Nghe Audio</button> : <span style={styles.missingBadge}>Thiếu Audio</span>}
                    </div>
                  </div>

                  <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                    <button type="submit" style={{...styles.primaryBtn, background: editingId ? '#9c27b0' : '#4CAF50'}}>
                      {editingId ? "💾 Lưu Cập Nhật Database" : "💾 Thêm Quán Mới"}
                    </button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setNewRest({ name: "", specialty_dish: "", image_url: "", description: "", description_en: "", description_ko: "", description_zh: "", description_ja: "", audio_vi: "", audio_en: "", audio_ko: "", audio_zh: "", audio_ja: "", lat: 10.7612, lng: 106.7055 }); }} style={{padding: '10px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc'}}>Hủy Sửa</button>}
                  </div>
                </form>
              </div>

              {/* DANH SÁCH QUÁN ĂN */}
              <div style={{...styles.card, padding: '20px'}}>
                <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>📋 Danh Sách Quán Ăn</h3>
                {Array.isArray(restaurants) && restaurants.map(rest => (
                  <div key={rest.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee'}}>
                    <div><strong>{rest.name}</strong> - {rest.audio_en ? "✅ Có Audio AI" : "❌ Thiếu Audio"}</div>
                    <div style={{display: 'flex', gap: '10px'}}>
                      <button onClick={() => handleEditClick(rest)} style={{padding: '5px 10px', background: '#9c27b0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>✏️ Sửa / Review AI</button>
                      <button onClick={() => handleDeleteRestaurant(rest.id, rest.name)} style={{padding: '5px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>🗑️ Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {adminTab === "requests" && (
            <div style={{...styles.card, padding: '20px'}}>
              <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>⏳ Yêu Cầu Chờ Duyệt</h3>
              {Array.isArray(requestsList) && requestsList.filter(r => r.status === 'pending').length === 0 ? (
                <p style={{textAlign: 'center', padding: '20px', color: '#666'}}>Không có yêu cầu nào đang chờ.</p>
              ) : (
                Array.isArray(requestsList) && requestsList.filter(r => r.status === 'pending').map(req => (
                  <div key={req.id} style={{border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '15px', background: '#fff'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                      <div>
                        <strong style={{fontSize: '16px'}}>{req.name}</strong>
                        <div style={{fontSize: '12px', color: '#666'}}>Người gửi: {req.owner_name} | {new Date(req.created_at).toLocaleString()}</div>
                      </div>
                      <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={() => handleApproveRequest(req.id)} style={{padding: '8px 15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>Duyệt ✅</button>
                        <button onClick={() => handleRejectRequest(req.id)} style={{padding: '8px 15px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Từ chối ❌</button>
                      </div>
                    </div>
                    <div style={{fontSize: '13px', background: '#f9f9f9', padding: '10px', borderRadius: '5px'}}>
                      <div><strong>Món:</strong> {req.specialty_dish}</div>
                      <div style={{marginTop: '5px'}}><strong>Kịch bản:</strong> {req.description.substring(0, 100)}...</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {adminTab === "users" && (
            <>
              {/* FORM THÊM/SỬA USER */}
              <div style={{...styles.card, padding: '20px', marginBottom: '30px', borderTop: editingUserId ? '4px solid #9c27b0' : '4px solid #2196F3'}}>
                <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                  {editingUserId ? "✏️ Cập Nhật Người Dùng" : "➕ Thêm Tài Khoản Mới"}
                </h3>
                <form onSubmit={handleSaveUser}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', alignItems: 'end'}}>
                    <div>
                      <label style={styles.label}>Tên tài khoản (*)</label>
                      <input required value={newUserForm.username} onChange={e=>setNewUserForm({...newUserForm, username: e.target.value})} style={styles.input} disabled={!!editingUserId} />
                    </div>
                    <div>
                      <label style={styles.label}>{editingUserId ? "Đổi mật khẩu mới (Bỏ trống nếu giữ nguyên)" : "Mật khẩu (*)"}</label>
                      <input type="password" required={!editingUserId} value={newUserForm.password} onChange={e=>setNewUserForm({...newUserForm, password: e.target.value})} style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>Quyền hạn (Role)</label>
                      <select value={newUserForm.role} onChange={e=>setNewUserForm({...newUserForm, role: e.target.value})} style={{...styles.input, padding: '9px'}}>
                        <option value="app">app (Khách hàng)</option>
                        <option value="partner">partner (Đối tác)</option>
                        <option value="admin">admin (Quản trị viên)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{marginTop: '15px', display: 'flex', gap: '10px'}}>
                    <button type="submit" style={{...styles.primaryBtn, background: editingUserId ? '#9c27b0' : '#2196F3'}}>
                      {editingUserId ? "💾 Lưu Thay Đổi" : "💾 Tạo Tài Khoản"}
                    </button>
                    {editingUserId && <button type="button" onClick={() => { setEditingUserId(null); setNewUserForm({ username: "", password: "", role: "app" }); }} style={{padding: '10px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc'}}>Hủy Sửa</button>}
                  </div>
                </form>
              </div>

              {/* DANH SÁCH USER */}
              <div style={{...styles.card, padding: '20px'}}>
                <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>👥 Danh Sách Tài Khoản</h3>
                <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                  <thead>
                    <tr style={{background: '#f5f5f5', textAlign: 'left'}}>
                      <th style={{padding: '10px', borderBottom: '2px solid #ddd'}}>ID</th>
                      <th style={{padding: '10px', borderBottom: '2px solid #ddd'}}>Tài khoản</th>
                      <th style={{padding: '10px', borderBottom: '2px solid #ddd'}}>Quyền hạn</th>
                      <th style={{padding: '10px', borderBottom: '2px solid #ddd'}}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(usersList) && usersList.length > 0 ? usersList.map(u => (
                      <tr key={u.id} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: '10px'}}>{u.id}</td>
                        <td style={{padding: '10px', fontWeight: 'bold'}}>{u.username}</td>
                        <td style={{padding: '10px'}}>
                          <span style={{background: u.role === 'admin' ? '#ffebee' : '#e8f5e9', color: u.role === 'admin' ? '#c62828' : '#2e7d32', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{padding: '10px'}}>
                          <button onClick={() => handleEditUserClick(u)} style={{marginRight: '5px', padding: '5px 10px', background: '#9c27b0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Sửa</button>
                          {user?.username !== u.username && (
                            <button onClick={() => handleDeleteUser(u.id, u.username)} style={{padding: '5px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Xóa</button>
                          )}
                        </td>
                      </tr>
                    )) : <tr><td colSpan={4} style={{textAlign: 'center', padding: '20px'}}>Chưa có dữ liệu người dùng.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </div>
    );
  }
  // ==========================================
  // GIAO DIỆN 3: BẢN ĐỒ KHÁCH HÀNG
  // ==========================================
  return (
    <div style={styles.container}>
      <div style={styles.floatingUserBar}>
        <div style={{fontSize: '13px'}}>👋 Chào, <strong>{user?.username}</strong> {user?.role === 'admin' && <span style={{background: '#ff5252', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontSize: '10px'}}>ADMIN</span>} {user?.role === 'partner' && <span style={{background: '#009688', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontSize: '10px'}}>PARTNER</span>}</div>
        <div style={{display: 'flex', gap: '10px'}}>
          {user?.role === 'admin' && <button onClick={() => setAuthMode("admin")} style={{background: '#ff9800', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'}}>⚙️ Quản lý</button>}
          {user?.role === 'partner' && <button onClick={() => setAuthMode("partner")} style={{background: '#009688', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'}}>🏪 Cửa hàng</button>}
          <button onClick={handleLogout} style={{background: 'transparent', border: '1px solid white', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Thoát</button>
        </div>
      </div>
      <div style={styles.floatingHeader}>
        <h1 style={{ margin: 0, fontSize: '16px', color: '#009688' }}>📍 Vĩnh Khánh Map</h1>
        <div style={{display:'flex', gap:'5px'}}>
          {LANGUAGES.map(lang => (
            <button key={lang.code} onClick={() => setLanguage(lang.code)} style={{...styles.langBtn, background: language === lang.code ? '#009688' : 'white', color: language === lang.code ? 'white' : 'black', borderColor: '#009688'}}>{lang.flag}</button>
          ))}
        </div>
      </div>
      <MapContainer center={mapCenter} zoom={16} style={styles.map} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController center={mapCenter} />
        {userLocation && <Marker position={userLocation} icon={blueIcon}><Popup>🌟 Bạn đang ở đây!</Popup></Marker>}
        {restaurants.map(rest => (
          <Marker key={rest.id} position={[rest.lat, rest.lng]} icon={redIcon}>
            <Popup minWidth={250}>
              <div style={styles.popupContent}>
                <img src={rest.image_url || "https://placehold.co/200x150"} alt={rest.name} style={styles.popupImg} />
                <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px' }}>{rest.name}</h3><span style={styles.badge}>🔥 {rest.specialty_dish}</span>
                <p style={styles.popupDesc}>{rest[LANGUAGES.find(l => l.code === language)?.dbCol as keyof Restaurant] || "Chưa có nội dung."}</p>
                <button 
                  style={{...styles.playBtn, background: audioUrl === "playing" ? "#4CAF50" : "#009688"}} 
                  onClick={() => handlePlayAudioForUser(rest)}
                >
                  {audioUrl === "playing" ? "🟢 Đang phát..." : "🔊 Nghe Audio"}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { fontFamily: 'Arial, sans-serif', height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' },
  map: { height: '100%', width: '100%', zIndex: 1 },
  floatingUserBar: { position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: '#333', color: 'white', padding: '8px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '90%', maxWidth: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
  floatingHeader: { position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'white', padding: '8px 15px', borderRadius: '50px', boxShadow: '0 5px 15px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '15px', width: '90%', maxWidth: '400px', justifyContent: 'space-between' },
  card: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' },
  statCard: { flex: 1, background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' },
  input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px', fontFamily: 'inherit' },
  label: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#555' },
  primaryBtn: { width: '100%', padding: '12px', background: '#009688', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  langBtn: { cursor: 'pointer', fontSize: '16px', border: '1px solid', borderRadius: '5px', padding: '2px 5px', transition: '0.2s' },
  popupContent: { width: '100%', display: 'flex', flexDirection: 'column' },
  popupImg: { width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' },
  badge: { display: 'inline-block', background: '#fff3e0', color: '#e65100', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '8px' },
  popupDesc: { fontSize: '13px', color: '#555', lineHeight: '1.4', margin: '0 0 12px 0', maxHeight: '80px', overflowY: 'auto' },
  playBtn: { width: '100%', padding: '10px', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  aiResultBox: { background: '#fafafa', padding: '10px', borderRadius: '8px', border: '1px solid #eee' },
  playTestBtn: { background: '#ff9800', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginTop: '5px', fontWeight: 'bold' },
  missingBadge: { fontSize: '11px', color: 'red', fontStyle: 'italic', display: 'block', marginTop: '5px' },
  adminTabActive: { background: '#2196F3', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
  adminTabInactive: { background: '#e0e0e0', color: '#555', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '15px' },
};
