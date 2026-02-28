import { db } from "./db";
import {
  products, orders, orderItems, users,
  type InsertProduct, type Product,
  type InsertOrder, type Order,
  type InsertOrderItem, type OrderItem,
  type User, type CreateOrderRequest, type OrderResponse
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Orders
  getOrders(): Promise<OrderResponse[]>;
  getOrder(id: number): Promise<OrderResponse | undefined>;
  createOrder(order: CreateOrderRequest): Promise<OrderResponse>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Auth
  getUserByUsername(username: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(update).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getOrders(): Promise<OrderResponse[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const allOrderItems = await db.select().from(orderItems);
    const allProducts = await db.select().from(products);

    return allOrders.map(order => {
      const items = allOrderItems
        .filter(item => item.orderId === order.id)
        .map(item => ({
          ...item,
          product: allProducts.find(p => p.id === item.productId)!
        }));
      return { ...order, items };
    });
  }

  async getOrder(id: number): Promise<OrderResponse | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    const allProducts = await db.select().from(products);

    const itemsWithProduct = items.map(item => ({
      ...item,
      product: allProducts.find(p => p.id === item.productId)!
    }));

    return { ...order, items: itemsWithProduct };
  }

  async createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
    const { items, ...orderData } = request;
    
    // Create order
    const [newOrder] = await db.insert(orders).values(orderData).returning();

    // Create items
    const itemsToInsert = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    const newItems = await db.insert(orderItems).values(itemsToInsert).returning();
    
    const allProducts = await db.select().from(products);
    const itemsWithProduct = newItems.map(item => ({
      ...item,
      product: allProducts.find(p => p.id === item.productId)!
    }));

    return { ...newOrder, items: itemsWithProduct };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updated;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
}

export const storage = new DatabaseStorage();
