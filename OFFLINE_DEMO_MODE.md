# Offline Demo Mode (Bypassing the Backend)

If you want to run the frontend locally and explore the UI without setting up Python or PostgreSQL, follow these steps.

## 1. Bypassing Login (Console Method)
You can manually inject a user session into your browser's storage. This is the safest way because you don't have to change your code.

1.  Start your React app: `npm run dev`.
2.  Open `http://localhost:3000`.
3.  Open **Developer Tools** (F12) -> **Console**.
4.  Run this command to become an **Admin**:
    ```javascript
    localStorage.setItem("foodMapUser", JSON.stringify({
      username: "Admin_Demo",
      role: "admin",
      token: "mock-jwt-token"
    }));
    window.location.reload();
    ```
5.  To test as a **Partner**, change `role: "admin"` to `role: "partner"`.

---

## 2. Hardcoding Mock Data
Since there is no backend, `axios.get("/api/nearby")` will fail, and the map will be empty. To see markers, you can add mock data to your `useEffect`.

**In `src/App.tsx`, find `fetchRestaurants` and change it to:**
```typescript
const fetchRestaurants = async () => { 
  // Mock data for offline testing
  const mockData = [
    {
      id: 1,
      name: "Quán Ốc Demo",
      specialty_dish: "Ốc hương",
      image_url: "https://picsum.photos/200",
      description: "Quán ăn demo không cần backend",
      lat: 10.7612,
      lng: 106.7055,
      audio_vi: ""
    }
  ];
  setRestaurants(mockData);
};
```

---

## 3. Disabling Axios Errors
While offline, Axios will try to connect to `localhost:8000` and show errors in the console. You can ignore these, or temporarily comment out the `axios.defaults.baseURL` line at the top of `App.tsx`.

## 4. When you are ready to go Live
Once you have installed PostgreSQL and started your Python server:
1.  Clear your browser storage: `localStorage.clear()`.
2.  Undo the mock data changes in `fetchRestaurants`.
3.  Ensure `axios.defaults.baseURL` is pointing to `http://localhost:8000`.
