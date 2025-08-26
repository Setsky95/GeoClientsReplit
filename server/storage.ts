import { type Customer, type InsertCustomer, type UpdateCustomer } from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export interface IStorage {
  getCustomer(id: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: UpdateCustomer): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;
  searchCustomers(query: string): Promise<Customer[]>;
}

export class JSONStorage implements IStorage {
  private customers: Map<string, Customer>;
  private filePath: string;

  constructor(filePath: string = "customers.json") {
    this.customers = new Map();
    this.filePath = path.resolve(filePath);
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const customers: Customer[] = JSON.parse(data);
      this.customers = new Map(customers.map(customer => [customer.id, customer]));
      console.log(`[storage] Cargados ${customers.length} clientes desde ${this.filePath}`);
    } catch (error) {
      // Si el archivo no existe o hay error, empezar con datos vacíos
      console.log(`[storage] Creando nuevo archivo de datos en ${this.filePath}`);
      this.customers = new Map();
      await this.saveData();
    }
  }

  private async saveData(): Promise<void> {
    try {
      const customers = Array.from(this.customers.values());
      await fs.writeFile(this.filePath, JSON.stringify(customers, null, 2), "utf-8");
    } catch (error) {
      console.error("[storage] Error guardando datos:", error);
    }
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(id, customer);
    await this.saveData();
    return customer;
  }

  async updateCustomer(id: string, updateData: UpdateCustomer): Promise<Customer | undefined> {
    const existing = this.customers.get(id);
    if (!existing) return undefined;
    
    const updated: Customer = { ...existing, ...updateData };
    this.customers.set(id, updated);
    await this.saveData();
    return updated;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const deleted = this.customers.delete(id);
    if (deleted) {
      await this.saveData();
    }
    return deleted;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.customers.values()).filter(customer =>
      customer.name.toLowerCase().includes(lowercaseQuery) ||
      customer.address.toLowerCase().includes(lowercaseQuery) ||
      customer.phone.includes(query) ||
      (customer.description && customer.description.toLowerCase().includes(lowercaseQuery))
    );
  }
}

export const storage = new JSONStorage();
