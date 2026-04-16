# Logic Changes: Authentication (Login & Register)

This document describes how to update the authentication logic in `src/App.tsx` to match the Python FastAPI backend.

## 1. Registration Logic (`handleRegister`)
The Python backend expects a `username` and `password`.

**Current Logic (Node.js):**
*   Checks `db.users` locally or via a mock API.
*   Hashes password (sometimes) on the frontend.

**New Logic (Python):**
```typescript
const handleRegister = async () => {
  try {
    const res = await axios.post("/api/register", {
      username: regUsername,
      password: regPassword
    });
    
    if (res.data.error) {
      alert(res.data.error);
    } else {
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      setIsRegistering(false);
    }
  } catch (err) {
    alert("Lỗi kết nối server.");
  }
};
```

## 2. Login Logic (`handleLogin`)
The Python backend returns a JWT token, the user's role, and their username.

**Current Logic (Node.js):**
*   Often returns a simple user object.
*   Role might be hardcoded or from a local JSON.

**New Logic (Python):**
```typescript
const handleLogin = async () => {
  try {
    const res = await axios.post("/api/login", {
      username,
      password
    });

    if (res.data.error) {
      alert(res.data.error);
    } else {
      // Save to state and localStorage
      const userData = {
        username: res.data.username,
        role: res.data.role, // 'admin', 'partner', or 'user' (customer)
        token: res.data.token
      };
      setUser(userData);
      localStorage.setItem("foodMapUser", JSON.stringify(userData));
      
      // Set default Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
  } catch (err) {
    alert("Sai tài khoản hoặc mật khẩu!");
  }
};
```

## 3. Role Mapping
The Python backend uses the following roles:
*   `admin`: Full access to stats and request approval.
*   `partner`: Access to the Partner Portal to manage their own restaurants.
*   `user`: Standard customer access (view map, play audio).

Ensure your `useEffect` that checks `localStorage` also sets the `Authorization` header if a token exists.
