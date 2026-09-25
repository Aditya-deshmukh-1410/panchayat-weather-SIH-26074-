import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async checkHealth() {
    const mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL', 'http://localhost:8000');
    let mlServiceStatus = { status: 'unknown', details: null as any };

    try {
      const response = await axios.get(`${mlServiceUrl}/health`, { timeout: 15000 });
      mlServiceStatus = { status: 'connected', details: response.data };
    } catch (err: any) {
      mlServiceStatus = {
        status: 'unreachable',
        details: {
          message: err.message,
          code: err.code ?? null,
          status: err.response?.status ?? null,
          response: err.response?.data ?? null,
          url: `${mlServiceUrl}/health`,
        },
      };
    }

    const dbHealth = await this.databaseService.getHealthStatus();

    return {
      status: 'ok',
      service: 'panchayat-backend',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbHealth,
        ml_service: mlServiceStatus,
      },
    };
  }

  @Get('study-area')
  async getStudyArea() {
    try {
      const client = await this.databaseService.getPool().connect();
      try {
        const blockRes = await client.query('SELECT * FROM blocks WHERE id = $1', ['B01_BARAMATI']);
        const panchayatsRes = await client.query(`
          SELECT id, name, census_code, area_sqkm, elevation_m,
                 centroid_lat, centroid_lon,
                 ST_AsGeoJSON(geometry) AS geojson
          FROM panchayats
          ORDER BY id;
        `);
        return {
          status: 'ok',
          block: blockRes.rows[0] || null,
          total_panchayats: panchayatsRes.rowCount,
          panchayats: panchayatsRes.rows.map(r => ({
            id: r.id,
            name: r.name,
            census_code: r.census_code,
            area_sqkm: r.area_sqkm,
            elevation_m: r.elevation_m,
            latitude: r.centroid_lat,
            longitude: r.centroid_lon,
            geometry: JSON.parse(r.geojson)
          }))
        };
      } finally {
        client.release();
      }
    } catch (err: any) {
      return {
        status: 'error',
        message: err.message
      };
    }
  }
}
