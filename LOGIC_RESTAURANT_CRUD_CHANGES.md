# Logic Changes: Restaurant CRUD (Nearby & Management)

This document describes how to update the restaurant data handling to match the Python FastAPI backend's PostGIS structure.

## 1. Fetching Restaurants (`fetchRestaurants`)
The Python backend uses `ST_X` and `ST_Y` to provide `lat` and `lng` as direct properties of the restaurant object.

**New Logic (Python):**
```typescript
const fetchRestaurants = async () => {
  try {
    const res = await axios.get("/api/nearby");
    // The Python backend returns an array where each item has:
    // id, name, description, specialty_dish, image_url, 
    // description_en, description_ko, description_zh, description_ja,
    // audio_vi, audio_en, audio_ko, audio_zh, audio_ja,
    // lat, lng
    setRestaurants(res.data);
  } catch (err) {
    console.error("Lỗi tải dữ liệu quán ăn:", err);
  }
};
```

## 2. Adding a Restaurant (`handleAddRestaurant`)
The Python backend expects a `RestaurantData` model. Note that `lat` and `lng` must be sent as numbers.

**New Logic (Python):**
```typescript
const handleAddRestaurant = async () => {
  try {
    const payload = {
      name: newRest.name,
      specialty_dish: newRest.specialty_dish,
      image_url: newRest.image_url,
      description: newRest.description,
      description_en: newRest.description_en,
      description_ko: newRest.description_ko,
      description_zh: newRest.description_zh,
      description_ja: newRest.description_ja,
      lat: parseFloat(newRest.lat.toString()),
      lng: parseFloat(newRest.lng.toString()),
      audio_vi: newRest.audio_vi,
      audio_en: newRest.audio_en,
      audio_ko: newRest.audio_ko,
      audio_zh: newRest.audio_zh,
      audio_ja: newRest.audio_ja
    };

    const res = await axios.post("/api/restaurants", payload);
    alert(res.data.message);
    fetchRestaurants(); // Refresh map
    setShowAddModal(false);
  } catch (err) {
    alert("Lỗi khi thêm quán ăn.");
  }
};
```

## 3. Updating a Restaurant (`handleUpdateRestaurant`)
Uses the `PUT /api/restaurants/{id}` endpoint.

**New Logic (Python):**
```typescript
const handleUpdateRestaurant = async (id: number) => {
  try {
    const res = await axios.put(`/api/restaurants/${id}`, newRest);
    alert(res.data.message);
    fetchRestaurants();
    setEditingRest(null);
  } catch (err) {
    alert("Lỗi khi cập nhật.");
  }
};
```

## 4. Deleting a Restaurant (`handleDeleteRestaurant`)
Uses the `DELETE /api/restaurants/{id}` endpoint.

**New Logic (Python):**
```typescript
const handleDeleteRestaurant = async (id: number) => {
  if (!window.confirm("Bạn có chắc muốn xóa quán này?")) return;
  try {
    const res = await axios.delete(`/api/restaurants/${id}`);
    alert(res.data.message);
    fetchRestaurants();
  } catch (err) {
    alert("Lỗi khi xóa.");
  }
};
```
