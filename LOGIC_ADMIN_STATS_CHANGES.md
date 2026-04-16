# Logic Changes: Admin Dashboard & Stats

This document describes how to update the Admin dashboard to use the Python `/api/stats` endpoint.

## 1. Fetching Stats (`fetchStats`)
The Python backend provides a single endpoint for system-wide statistics.

**New Logic (Python):**
```typescript
const fetchStats = async () => {
  try {
    const res = await axios.get("/api/stats");
    // Python returns: { total_users, total_restaurants, total_visits }
    setStats({
      users: res.data.total_users,
      restaurants: res.data.total_restaurants,
      visits: res.data.total_visits
    });
  } catch (err) {
    console.error("Lỗi tải thống kê:", err);
  }
};
```

## 2. Request Approval Logic
The Python backend code you provided handles direct CRUD (`POST`, `PUT`, `DELETE`). If you want to keep the "Request Approval" workflow from the current app:

1.  **Partner Portal**: Instead of calling `axios.post("/api/restaurants")`, the partner should call a new endpoint `axios.post("/api/requests")`.
2.  **Admin Panel**: The admin views these requests and, upon approval, calls the Python `axios.post("/api/restaurants")` with the request data.

**Note:** Your current Python file does not have a `requests` table yet. You would need to add a table for `pending_requests` in PostgreSQL to support this specific logic.

## 3. UI Integration
The layout of the Admin dashboard remains the same, but the `useEffect` should trigger `fetchStats()` whenever the admin tab is active.

```typescript
useEffect(() => {
  if (user?.role === 'admin') {
    fetchStats();
  }
}, [user]);
```
