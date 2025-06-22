import { SheetName, SheetData } from '../types';

// Multi-environment database service that works with:
// - Vercel Postgres (production on Vercel)
// - AWS RDS PostgreSQL (production on AWS)
// - Local PostgreSQL (development)
// - JSON files (fallback for development)

interface DatabaseAdapter {
  read<T>(table: string): Promise<T[]>;
  write<T>(table: string, data: T[]): Promise<void>;
  append<T extends SheetData>(table: string, data: Omit<T, 'ID'>): Promise<T>;
  update<T extends SheetData>(table: string, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T>;
  delete(table: string, id: number): Promise<void>;
  healthCheck(): Promise<{ status: string; details: any }>;
}

// PostgreSQL adapter for both Vercel and AWS
class PostgreSQLAdapter implements DatabaseAdapter {
  private connectionString: string;
  private client: any = null;

  constructor() {
    // Environment-aware connection string
    this.connectionString = this.getConnectionString();
  }

  private getConnectionString(): string {
    // Priority order for connection strings:
    // 1. POSTGRES_URL (Vercel Postgres)
    // 2. DATABASE_URL (AWS RDS or other)
    // 3. Manual construction for development
    
    if (process.env.POSTGRES_URL) {
      console.log('🚀 Using Vercel Postgres connection');
      return process.env.POSTGRES_URL;
    }
    
    if (process.env.DATABASE_URL) {
      console.log('☁️ Using AWS RDS PostgreSQL connection');
      return process.env.DATABASE_URL;
    }
    
    // Development fallback
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const database = process.env.DB_NAME || 'olympix_dev';
    const username = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || 'password';
    
    console.log('💾 Using local PostgreSQL connection');
    return `postgresql://${username}:${password}@${host}:${port}/${database}`;
  }

  private async getClient() {
    if (!this.client) {
      try {
        // Dynamic import to avoid bundling issues
        const { Pool } = await import('pg');
        this.client = new Pool({
          connectionString: this.connectionString,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        // Test connection
        await this.client.query('SELECT NOW()');
        console.log('✅ Database connection established');
      } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw new Error('Database connection failed');
      }
    }
    return this.client;
  }

  private async ensureTable(tableName: string): Promise<void> {
    const client = await this.getClient();
    
    // Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName.toLowerCase()} (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS ${tableName.toLowerCase()}_data_idx ON ${tableName.toLowerCase()} USING GIN (data);
    `;
    
    try {
      await client.query(createTableQuery);
      console.log(`✅ Table ${tableName} ready`);
    } catch (error) {
      console.error(`❌ Error creating table ${tableName}:`, error);
      throw error;
    }
  }

  async read<T>(table: string): Promise<T[]> {
    try {
      await this.ensureTable(table);
      const client = await this.getClient();
      
      const result = await client.query(
        `SELECT data FROM ${table.toLowerCase()} ORDER BY (data->>'ID')::int`
      );
      
      return result.rows.map((row: any) => row.data);
    } catch (error) {
      console.error(`❌ Error reading from ${table}:`, error);
      return [];
    }
  }

  async write<T>(table: string, data: T[]): Promise<void> {
    try {
      await this.ensureTable(table);
      const client = await this.getClient();
      
      // Start transaction
      await client.query('BEGIN');
      
      // Clear existing data
      await client.query(`DELETE FROM ${table.toLowerCase()}`);
      
      // Insert new data
      for (const item of data) {
        await client.query(
          `INSERT INTO ${table.toLowerCase()} (data) VALUES ($1)`,
          [JSON.stringify(item)]
        );
      }
      
      await client.query('COMMIT');
      console.log(`🔄 Updated ${table} with ${data.length} records`);
    } catch (error) {
      const client = await this.getClient();
      await client.query('ROLLBACK');
      console.error(`❌ Error writing to ${table}:`, error);
      throw error;
    }
  }

  async append<T extends SheetData>(table: string, data: Omit<T, 'ID'>): Promise<T> {
    try {
      await this.ensureTable(table);
      const client = await this.getClient();
      
      // Get next ID
      const existingData = await this.read<T>(table);
      const newId = existingData.length ? Math.max(...existingData.map(r => r.ID)) + 1 : 1;
      
      const newRecord = { ID: newId, ...data } as T;
      
      await client.query(
        `INSERT INTO ${table.toLowerCase()} (data) VALUES ($1)`,
        [JSON.stringify(newRecord)]
      );
      
      console.log(`➕ Added record to ${table} with ID ${newId}`);
      return newRecord;
    } catch (error) {
      console.error(`❌ Error appending to ${table}:`, error);
      throw error;
    }
  }

  async update<T extends SheetData>(table: string, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T> {
    try {
      await this.ensureTable(table);
      const client = await this.getClient();
      
      // Get existing record
      const result = await client.query(
        `SELECT data FROM ${table.toLowerCase()} WHERE (data->>'ID')::int = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Record with ID ${id} not found in ${table}`);
      }
      
      const existingRecord = result.rows[0].data;
      const updatedRecord = { ...existingRecord, ...data } as T;
      
      await client.query(
        `UPDATE ${table.toLowerCase()} SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE (data->>'ID')::int = $2`,
        [JSON.stringify(updatedRecord), id]
      );
      
      console.log(`🔄 Updated record ${id} in ${table}`);
      return updatedRecord;
    } catch (error) {
      console.error(`❌ Error updating ${table}:`, error);
      throw error;
    }
  }

  async delete(table: string, id: number): Promise<void> {
    try {
      await this.ensureTable(table);
      const client = await this.getClient();
      
      const result = await client.query(
        `DELETE FROM ${table.toLowerCase()} WHERE (data->>'ID')::int = $1`,
        [id]
      );
      
      if (result.rowCount === 0) {
        throw new Error(`Record with ID ${id} not found in ${table}`);
      }
      
      console.log(`🗑️ Deleted record ${id} from ${table}`);
    } catch (error) {
      console.error(`❌ Error deleting from ${table}:`, error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const client = await this.getClient();
      const result = await client.query('SELECT version(), current_database(), current_user');
      
      return {
        status: 'healthy',
        details: {
          database: 'PostgreSQL',
          version: result.rows[0].version,
          current_database: result.rows[0].current_database,
          current_user: result.rows[0].current_user,
          connection_string: this.connectionString.replace(/\/\/.*@/, '//***:***@') // Hide credentials
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

// JSON file fallback adapter for development without PostgreSQL
class JSONFallbackAdapter implements DatabaseAdapter {
  private dataDir: string;

  constructor() {
    this.dataDir = require('path').join(__dirname, '../../../data');
  }

  private getFilePath(table: string): string {
    return require('path').join(this.dataDir, `${table.toLowerCase()}.json`);
  }

  async read<T>(table: string): Promise<T[]> {
    try {
      const fs = await import('fs').then(m => m.promises);
      const filePath = this.getFilePath(table);
      const data = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(data);
      
      if (jsonData[table]) {
        return jsonData[table];
      } else if (Array.isArray(jsonData)) {
        return jsonData;
      } else {
        return Object.values(jsonData).find(val => Array.isArray(val)) as T[] || [];
      }
    } catch (error) {
      console.warn(`JSON file not found for ${table}, returning empty array`);
      return [];
    }
  }

  async write<T>(table: string, data: T[]): Promise<void> {
    const fs = await import('fs').then(m => m.promises);
    const filePath = this.getFilePath(table);
    
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ [table]: data }, null, 2));
    console.log(`📁 JSON: Wrote ${data.length} records to ${table}`);
  }

  async append<T extends SheetData>(table: string, data: Omit<T, 'ID'>): Promise<T> {
    const existingData = await this.read<T>(table);
    const newId = existingData.length ? Math.max(...existingData.map(r => r.ID)) + 1 : 1;
    const newRecord = { ID: newId, ...data } as T;
    
    existingData.push(newRecord);
    await this.write(table, existingData);
    
    console.log(`📁 JSON: Added record to ${table} with ID ${newId}`);
    return newRecord;
  }

  async update<T extends SheetData>(table: string, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T> {
    const existingData = await this.read<T>(table);
    const index = existingData.findIndex(r => r.ID === id);
    
    if (index === -1) {
      throw new Error(`Record with ID ${id} not found in ${table}`);
    }
    
    existingData[index] = { ...existingData[index], ...data } as T;
    await this.write(table, existingData);
    
    console.log(`📁 JSON: Updated record ${id} in ${table}`);
    return existingData[index];
  }

  async delete(table: string, id: number): Promise<void> {
    const existingData = await this.read(table);
    const filteredData = existingData.filter((r: any) => r.ID !== id);
    
    if (filteredData.length === existingData.length) {
      throw new Error(`Record with ID ${id} not found in ${table}`);
    }
    
    await this.write(table, filteredData);
    console.log(`📁 JSON: Deleted record ${id} from ${table}`);
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    return {
      status: 'healthy',
      details: {
        database: 'JSON Files',
        storage: 'Local filesystem',
        data_directory: this.dataDir
      }
    };
  }
}

// Multi-environment database service
export class DatabaseService {
  private static adapter: DatabaseAdapter | null = null;

  private static async getAdapter(): Promise<DatabaseAdapter> {
    if (!this.adapter) {
      const environment = process.env.NODE_ENV;
      const hasPostgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
      
      if (environment === 'production' || hasPostgresUrl) {
        try {
          console.log('🗄️ Attempting PostgreSQL connection...');
          this.adapter = new PostgreSQLAdapter();
          
          // Test the connection
          await this.adapter.healthCheck();
          console.log('✅ PostgreSQL adapter initialized');
        } catch (error) {
          console.warn('⚠️ PostgreSQL connection failed, falling back to JSON files');
          this.adapter = new JSONFallbackAdapter();
        }
      } else {
        console.log('📁 Using JSON file adapter for development');
        this.adapter = new JSONFallbackAdapter();
      }
    }
    
    return this.adapter;
  }

  static async readSheet<T extends SheetData>(sheetName: SheetName): Promise<T[]> {
    const adapter = await this.getAdapter();
    return await adapter.read<T>(sheetName);
  }

  static async appendToSheet<T extends SheetData>(sheetName: SheetName, data: Omit<T, 'ID'>): Promise<T> {
    const adapter = await this.getAdapter();
    return await adapter.append<T>(sheetName, data);
  }

  static async updateInSheet<T extends SheetData>(sheetName: SheetName, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T> {
    const adapter = await this.getAdapter();
    return await adapter.update<T>(sheetName, id, data);
  }

  static async deleteFromSheet(sheetName: SheetName, id: number): Promise<void> {
    const adapter = await this.getAdapter();
    return await adapter.delete(sheetName, id);
  }

  static async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const adapter = await this.getAdapter();
      return await adapter.healthCheck();
    } catch (error) {
      return {
        status: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  static getEnvironmentInfo(): { environment: string; adapter: string; message: string } {
    const environment = process.env.NODE_ENV || 'development';
    const hasPostgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (environment === 'production' || hasPostgresUrl) {
      return {
        environment,
        adapter: 'PostgreSQL',
        message: 'Production-grade PostgreSQL database - persistent and scalable'
      };
    } else {
      return {
        environment,
        adapter: 'JSON Files',
        message: 'Development JSON files - safe for local testing'
      };
    }
  }
}