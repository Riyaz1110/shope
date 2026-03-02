import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { users, products } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use(session({
  secret: process.env.SESSION_SECRET || 'cloudcluthes-secret',
  resave: false,
  saveUninitialized: false,
  store: new SessionStore({ checkPeriod: 86400000 }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  app.post(api.auth.login.path, async (req: any, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ message: "Logged in successfully" });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.auth.logout.path, (req: any, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, async (req: any, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    
    res.json({ username: user.username });
  });

  app.get(api.products.list.path, async (req, res) => {
    const prods = await storage.getProducts();
    res.json(prods);
  });

  app.get(api.products.get.path, async (req, res) => {
    const prod = await storage.getProduct(Number(req.params.id));
    if (!prod) return res.status(404).json({ message: "Product not found" });
    res.json(prod);
  });

  app.post(api.products.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      input.price = String(input.price);
      const prod = await storage.createProduct(input);
      res.status(201).json(prod);
    } catch (err: any) {
      res.status(400).json({ message: err.errors?.[0]?.message || "Invalid input" });
    }
  });

  app.put(api.products.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      if (input.price) input.price = String(input.price);
      const prod = await storage.updateProduct(Number(req.params.id), input);
      res.json(prod);
    } catch (err: any) {
      res.status(400).json({ message: err.errors?.[0]?.message || "Invalid input" });
    }
  });

  app.delete(api.products.delete.path, requireAuth, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).end();
  });

  app.get(api.orders.list.path, requireAuth, async (req, res) => {
    const allOrders = await storage.getOrders();
    res.json(allOrders);
  });

  app.get(api.orders.get.path, requireAuth, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      input.totalAmount = String(input.totalAmount);
      input.items = input.items.map((item: any) => ({
        ...item,
        price: String(item.price)
      }));
      
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ message: err.errors?.[0]?.message || "Invalid input" });
    }
  });

  app.patch(api.orders.updateStatus.path, requireAuth, async (req, res) => {
    try {
      const input = api.orders.updateStatus.input.parse(req.body);
      const order = await storage.updateOrderStatus(Number(req.params.id), input.status);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    await db.insert(users).values({
      username: 'admin@123',
      password: 'Riyaz@111006'
    });
  }

  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    await storage.createProduct({
      name: "Pearl Flower Hair Clip",
      description: "Beautiful pearl-studded flower clip for everyday elegance.",
      price: "15.00",
      imageUrl: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=800",
    });
    await storage.createProduct({
      name: "Silk Scrunchie Set",
      description: "Set of 3 pure silk scrunchies in pastel colors. Gentle on hair.",
      price: "24.50",
      imageUrl: "https://images.unsplash.com/photo-1605814234033-6490d1f736dc?auto=format&fit=crop&q=80&w=800",
    });
    await storage.createProduct({
      name: "Rhinestone Bobby Pins",
      description: "Sparkling rhinestone bobby pins for special occasions.",
      price: "12.00",
      imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
    });
    await storage.createProduct({
      name: "Velvet Bow Headband",
      description: "Luxurious velvet headband with a stylish knot bow.",
      price: "18.00",
      imageUrl: "https://images.unsplash.com/photo-1579893457912-1f35fb2ccfc2?auto=format&fit=crop&q=80&w=800",
    });
  }
}
