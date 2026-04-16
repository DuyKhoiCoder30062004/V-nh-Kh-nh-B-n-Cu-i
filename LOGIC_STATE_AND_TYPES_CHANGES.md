# Logic Changes: TypeScript Interfaces & State

This document describes the updates needed for your TypeScript types and React state to align with the Python backend's data model.

## 1. Updated `Restaurant` Interface
The Python backend uses a flat structure for coordinates (`lat`, `lng`) and includes 5 audio fields.

**New Interface:**
```typescript
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
  lat: number; // Top-level float
  lng: number; // Top-level float
  audio_vi: string; // Base64 string
  audio_en: string; // Base64 string
  audio_ko: string; // Base64 string
  audio_zh: string; // Base64 string
  audio_ja: string; // Base64 string
}
```

## 2. Updated `User` Interface
The user object now includes a JWT token.

**New Interface:**
```typescript
interface User {
  username: string;
  role: 'admin' | 'partner' | 'user';
  token: string;
}
```

## 3. State Initialization
Ensure your `newRest` state matches the new `Restaurant` interface.

```typescript
const [newRest, setNewRest] = useState<Partial<Restaurant>>({
  name: "",
  specialty_dish: "",
  image_url: "",
  description: "",
  lat: 10.762622, // Default to HCM City
  lng: 106.660172,
  audio_vi: "",
  audio_en: "",
  audio_ko: "",
  audio_zh: "",
  audio_ja: ""
});
```

## 4. Map Event Handling
When a user clicks the map to set a location, update the `lat` and `lng` directly.

```typescript
const MapEvents = () => {
  useMapEvents({
    click(e) {
      setNewRest(prev => ({
        ...prev,
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }));
    },
  });
  return null;
};
```
