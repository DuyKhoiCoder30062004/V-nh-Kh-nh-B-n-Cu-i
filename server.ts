import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";

const JWT_SECRET = process.env.JWT_SECRET || "vinhkhanh-secret-key";
const DB_FILE = "./database.json";

interface DbSchema {
  users: any[];
  restaurants: any[];
}

async function getDb(): Promise<DbSchema> {
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    const initialDb = { users: [], restaurants: [] };
    await fs.writeFile(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
}

async function saveDb(db: DbSchema) {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Seed admin user if not exists
  const db = await getDb();
  const adminExists = db.users.find(u => u.username === 'admin');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    db.users.push({
      id: Date.now(),
      username: "admin",
      password: hashedPassword,
      role: "admin"
    });
    await saveDb(db);
  }

  // API Routes
  app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    const db = await getDb();
    if (db.users.find(u => u.username === username)) {
      return res.status(400).json({ error: "Tên đăng nhập đã tồn tại!" });
    }
    try {
      const safePassword = password.substring(0, 70);
      const hashedPassword = await bcrypt.hash(safePassword, 10);
      db.users.push({
        id: Date.now(),
        username,
        password: hashedPassword,
        role: "app"
      });
      await saveDb(db);
      res.json({ message: "Đăng ký thành công!" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi hệ thống" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const db = await getDb();
    const user = db.users.find(u => u.username === username);
    const safePassword = password.substring(0, 70);
    if (user && await bcrypt.compare(safePassword, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
      res.json({ message: "Đăng nhập thành công!", username: user.username, role: user.role, token });
    } else {
      res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu!" });
    }
  });

  app.get("/api/nearby", async (req, res) => {
    const db = await getDb();
    res.json(db.restaurants);
  });

  app.get("/api/stats", async (req, res) => {
    const db = await getDb();
    const total_users = db.users.filter(u => u.role === 'app').length;
    const total_restaurants = db.restaurants.length;
    const total_visits = total_users * 12 + 154;
    res.json({
      total_users,
      total_restaurants,
      total_visits
    });
  });

  app.get("/api/users", async (req, res) => {
    const db = await getDb();
    const users = db.users.map(u => ({ id: u.id, username: u.username, role: u.role }));
    res.json(users);
  });

  app.post("/api/users", async (req, res) => {
    const { username, password, role } = req.body;
    const db = await getDb();
    if (db.users.find(u => u.username === username)) {
      return res.status(400).json({ error: "Tên đăng nhập đã tồn tại!" });
    }
    const safePassword = password.substring(0, 70);
    const hashedPassword = await bcrypt.hash(safePassword, 10);
    db.users.push({
      id: Date.now(),
      username,
      password: hashedPassword,
      role
    });
    await saveDb(db);
    res.json({ message: "User created successfully" });
  });

  app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;
    const db = await getDb();
    const userIndex = db.users.findIndex(u => u.id === parseInt(id));
    if (userIndex !== -1) {
      db.users[userIndex].username = username;
      db.users[userIndex].role = role;
      if (password) {
        const safePassword = password.substring(0, 70);
        db.users[userIndex].password = await bcrypt.hash(safePassword, 10);
      }
      await saveDb(db);
      res.json({ message: "User updated successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const db = await getDb();
    db.users = db.users.filter(u => u.id !== parseInt(id));
    await saveDb(db);
    res.json({ message: "User deleted successfully" });
  });

  app.post("/api/restaurants", async (req, res) => {
    const r = req.body;
    const db = await getDb();
    db.restaurants.push({
      ...r,
      id: Date.now()
    });
    await saveDb(db);
    res.json({ message: "Restaurant added successfully" });
  });

  app.put("/api/restaurants/:id", async (req, res) => {
    const { id } = req.params;
    const r = req.body;
    const db = await getDb();
    const index = db.restaurants.findIndex(rest => rest.id === parseInt(id));
    if (index !== -1) {
      db.restaurants[index] = { ...r, id: parseInt(id) };
      await saveDb(db);
      res.json({ message: "Restaurant updated successfully" });
    } else {
      res.status(404).json({ error: "Restaurant not found" });
    }
  });

  app.delete("/api/restaurants/:id", async (req, res) => {
    const { id } = req.params;
    const db = await getDb();
    db.restaurants = db.restaurants.filter(rest => rest.id !== parseInt(id));
    await saveDb(db);
    res.json({ message: "Restaurant deleted successfully" });
  });

  // Start listening immediately
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });

  // Vite middleware for development (Lazy loaded)
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware...");
    const startTime = Date.now();
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log(`Vite initialized in ${Date.now() - startTime}ms`);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

startServer();

