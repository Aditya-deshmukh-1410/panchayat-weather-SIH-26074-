import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor(private configService: ConfigService) {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ||
      `postgresql://${this.configService.get('POSTGRES_USER', 'postgres')}:${this.configService.get('POSTGRES_PASSWORD', 'postgres_password_panchayat')}@${this.configService.get('POSTGRES_HOST', 'localhost')}:${this.configService.get('POSTGRES_PORT', '5432')}/${this.configService.get('POSTGRES_DB', 'panchayat_weather')}`;

    this.pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
    });
  }

  async onModuleInit() {
    this.logger.log('Initializing Database Service...');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async getHealthStatus(): Promise<{ status: string; postgis_version?: string; error?: string }> {
    try {
      const client: PoolClient = await this.pool.connect();
      try {
        const res = await client.query('SELECT postgis_full_version();');
        return {
          status: 'connected',
          postgis_version: res.rows[0]?.postgis_full_version || 'active',
        };
      } finally {
        client.release();
      }
    } catch (err: any) {
      return {
        status: 'disconnected',
        error: err.message,
      };
    }
  }

  getPool(): Pool {
    return this.pool;
  }
}
