# Refactoring Logic: Admin Dashboards & Stats

The Admin and Partner portals now rely on live database counts instead of estimated or static mock data.

## 1. System Statistics
The component fetches live data from the `GET /api/stats` endpoint.

**Data returned:**
- `total_users`: Count of users with the 'user' role.
- `total_restaurants`: Count of all POIs in the database.
- `total_visits`: A calculated engagement score.

## 2. Admin & Partner Views
- **Admin**: Views system-wide stats and has permission to call `DELETE` on any restaurant.
- **Partner**: In a standard SaaS setup, the `nearby` list can be filtered by `owner_id`. The Python backend script provided (`main.py`) can be extended to support this by adding a `WHERE owner_id = ...` clause, which the frontend would call using `axios.get("/api/nearby?ownerId=" + user.id)`.

## 3. UI Consistency
The layout remains identical to the original version:
- The **Floating Bar** shows the current user and logout button.
- The **Language Selector** updates the `language` state, which then controls which `description_{lang}` and `audio_{lang}` fields are used in the map popups.
- The **MapContainer** re-renders markers whenever the `restaurants` state is updated by `fetchRestaurants()`.
