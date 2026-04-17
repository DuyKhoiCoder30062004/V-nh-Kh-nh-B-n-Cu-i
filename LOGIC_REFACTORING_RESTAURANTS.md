# Refactoring Logic: Restaurant Management & Maps

The restaurant management logic has been updated to support standard SQL data types and PostGIS spatial locations.

## 1. PostGIS Coordinate Handling
The Python backend stores coordinates in a `GEOGRAPHY(POINT, 4326)` column. 
- **Fetching**: The server uses `ST_X(location)` and `ST_Y(location)` to convert the point back into simple `lng` and `lat` numbers.
- **Saving**: The frontend sends `lat` and `lng` as numbers. The backend uses `ST_SetSRID(ST_MakePoint(lng, lat), 4326)` to save them.

## 2. Interface Update
The `Restaurant` interface in TypeScript now matches the flat structure of the SQL result:

```typescript
interface Restaurant {
  id: number;
  name: string;
  specialty_dish: string;
  image_url: string;
  description: string;
  // Translated fields from SQL
  description_en: string;
  description_ko: string;
  description_zh: string;
  description_ja: string;
  // Base64 Audio fields from SQL
  audio_vi: string;
  audio_en: string;
  audio_ko: string;
  audio_zh: string;
  audio_ja: string;
  // Extracted coordinates
  lat: number;
  lng: number;
}
```

## 3. CRUD Endpoints
- **Create**: `POST /api/restaurants`
- **Read**: `GET /api/nearby`
- **Update**: `PUT /api/restaurants/{id}`
- **Delete**: `DELETE /api/restaurants/{id}`

Each request now includes the `Authorization` header with the JWT token retrieved during login, ensuring that only authenticated users (Admin/Partner) can modify the culinary map.
