# Refactoring Logic: Authentication

The authentication logic in `App.tsx` has been simplified to directly interact with the Python FastAPI auth endpoints.

## 1. Login Logic
When a user logs in, the frontend sends a POST request to `/api/login`. 
The Python backend verifies the password using `bcrypt` and returns a JWT token if successful.

**Previous (Mock):**
Used local state or a simulated JSON check.

**New (FastAPI):**
```typescript
const handleAuth = async (e: React.FormEvent, isLogin: boolean) => {
  e.preventDefault();
  const endpoint = isLogin ? "/api/login" : "/api/register";
  try {
    const res = await axios.post(endpoint, { 
       username: usernameInput, 
       password: passwordInput 
    });
    
    if (res.data.error) {
      setAuthError(res.data.error);
    } else if (isLogin) {
      // Store the JWT token and user details
      const userData = {
        token: res.data.token,
        role: res.data.role,
        username: res.data.username
      };
      setUser(userData);
      localStorage.setItem("vinhkhanh_user", JSON.stringify(userData));
      
      // Set Default Authorization Header for subsequent calls
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Navigate based on role
      if (userData.role === 'admin') setAuthMode("admin");
      else if (userData.role === 'partner') setAuthMode("partner");
      else setAuthMode("app");
    }
  } catch (err) {
    setAuthError("Kết nối server thất bại");
  }
};
```

## 2. Token Security
By receiving a JWT `token` from the backend, we ensure that every subsequent API request (like adding a restaurant) can be verified on the server-side, preventing unauthorized users from modifying the database.
