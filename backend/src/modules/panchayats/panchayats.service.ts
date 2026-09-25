import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as fs from 'fs';
import * as path from 'path';

export interface PanchayatFeatureRecord {
  panchayat_id: string;
  panchayat_name: string;
  date: string;
  split: string;
  features: {
    block_rainfall: number;
    block_temp_max: number;
    block_temp_min: number;
    block_humidity: number;
    block_wind_speed: number;
    latitude: number;
    longitude: number;
    elevation_m: number;
    area_sqkm: number;
    dist_to_block_center_km: number;
    rainfall_lag_1d: number;
    rainfall_lag_2d: number;
    rainfall_lag_3d: number;
    rainfall_rolling_7d_mean: number;
    rainfall_rolling_7d_max: number;
    day_of_year: number;
    month: number;
  };
  baseline_block_rainfall: number;
  reference_target_rainfall_mm: number;
  provenance: {
    coarse_weather: string;
    reference_target: string;
  };
}

@Injectable()
export class PanchayatsService {
  private readonly logger = new Logger(PanchayatsService.name);
  private featureRecordsCache: Map<string, PanchayatFeatureRecord> = new Map();
  private cacheLoaded = false;

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Fetch all 14 Panchayats with PostGIS GeoJSON geometries and spatial metadata.
   */
  async getAllPanchayats() {
    const client = await this.databaseService.getPool().connect();
    try {
      // Static distance lookup derived from Baramati block center (centroid: 74.5807, 18.1517)
      const distLookup: Record<string, number> = {
        P01: 25.36,
        P02: 6.38,
        P03: 9.47,
        P04: 3.71,
        P05: 26.8,
        P06: 9.26,
        P07: 10.32,
        P08: 9.57,
        P09: 19.23,
        P10: 7.69,
        P11: 5.28,
        P12: 19.08,
        P13: 11.62,
        P14: 22.67,
      };

      const blockRes = await client.query('SELECT * FROM blocks WHERE id = $1', ['B01_BARAMATI']);
      const panchayatsRes = await client.query(`
        SELECT id, name, census_code, area_sqkm, elevation_m,
               centroid_lat, centroid_lon,
               ST_AsGeoJSON(geometry) AS geojson
        FROM panchayats
        ORDER BY id;
      `);

      const features = panchayatsRes.rows.map((r) => ({
        type: 'Feature',
        id: r.id,
        properties: {
          id: r.id,
          name: r.name,
          census_code: r.census_code,
          area_sqkm: Number(r.area_sqkm),
          elevation_m: Number(r.elevation_m),
          latitude: Number(r.centroid_lat),
          longitude: Number(r.centroid_lon),
          dist_to_block_center_km: distLookup[r.id] ?? 0.0,
          block_id: 'B01_BARAMATI',
          block_name: blockRes.rows[0]?.name || 'Baramati',
          district_name: blockRes.rows[0]?.district_name || 'Pune',
          state_name: blockRes.rows[0]?.state_name || 'Maharashtra',
        },
        geometry: JSON.parse(r.geojson),
      }));

      return {
        type: 'FeatureCollection',
        block: blockRes.rows[0] || null,
        total_panchayats: features.length,
        features,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Lazily loads and caches the 10,234 authentic feature rows from training_table_baramati.csv.
   */
  private loadFeatureRecords() {
    if (this.cacheLoaded) return;

    // Resolve path relative to backend root or workspace
    const possiblePaths = [
      path.resolve(__dirname, '../../../../data/processed/features/training_table_baramati.csv'),
      path.resolve(process.cwd(), '../data/processed/features/training_table_baramati.csv'),
      path.resolve(process.cwd(), 'data/processed/features/training_table_baramati.csv'),
      'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\scratch\\panchayat-weather\\data\\processed\\features\\training_table_baramati.csv',
    ];

    let csvPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) {
      this.logger.error('Could not locate training_table_baramati.csv in search paths');
      return;
    }

    this.logger.log(`Loading authentic feature table from: ${csvPath}`);
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].trim().split(',');
    const colIdx: Record<string, number> = {};
    headers.forEach((h, i) => (colIdx[h] = i));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',');

      const panchayatId = cols[colIdx['panchayat_id']];
      const date = cols[colIdx['date']];
      if (!panchayatId || !date) continue;

      const record: PanchayatFeatureRecord = {
        panchayat_id: panchayatId,
        panchayat_name: cols[colIdx['panchayat_name']],
        date: date,
        split: cols[colIdx['split']],
        features: {
          block_rainfall: parseFloat(cols[colIdx['block_rainfall']]),
          block_temp_max: parseFloat(cols[colIdx['block_temp_max']]),
          block_temp_min: parseFloat(cols[colIdx['block_temp_min']]),
          block_humidity: parseFloat(cols[colIdx['block_humidity']]),
          block_wind_speed: parseFloat(cols[colIdx['block_wind_speed']]),
          latitude: parseFloat(cols[colIdx['latitude']]),
          longitude: parseFloat(cols[colIdx['longitude']]),
          elevation_m: parseFloat(cols[colIdx['elevation_m']]),
          area_sqkm: parseFloat(cols[colIdx['area_sqkm']]),
          dist_to_block_center_km: parseFloat(cols[colIdx['dist_to_block_center_km']]),
          rainfall_lag_1d: parseFloat(cols[colIdx['rainfall_lag_1d']]),
          rainfall_lag_2d: parseFloat(cols[colIdx['rainfall_lag_2d']]),
          rainfall_lag_3d: parseFloat(cols[colIdx['rainfall_lag_3d']]),
          rainfall_rolling_7d_mean: parseFloat(cols[colIdx['rainfall_rolling_7d_mean']]),
          rainfall_rolling_7d_max: parseFloat(cols[colIdx['rainfall_rolling_7d_max']]),
          day_of_year: parseInt(cols[colIdx['day_of_year']], 10),
          month: parseInt(cols[colIdx['month']], 10),
        },
        baseline_block_rainfall: parseFloat(cols[colIdx['block_rainfall']]),
        reference_target_rainfall_mm: parseFloat(cols[colIdx['panchayat_rainfall_mm']]),
        provenance: {
          coarse_weather: cols[colIdx['provenance_block']],
          reference_target: cols[colIdx['provenance_target']],
        },
      };

      const key = `${panchayatId}_${date}`;
      this.featureRecordsCache.set(key, record);
    }

    this.cacheLoaded = true;
    this.logger.log(`Successfully cached ${this.featureRecordsCache.size} authentic feature rows.`);
  }

  /**
   * Retrieves real feature row for a given Panchayat and date (defaults to 2024-09-01).
   */
  getPanchayatFeatures(panchayatId: string, requestedDate = '2024-09-01'): PanchayatFeatureRecord {
    this.loadFeatureRecords();

    const normalizedId = panchayatId.toUpperCase();
    const key = `${normalizedId}_${requestedDate}`;
    const record = this.featureRecordsCache.get(key);

    if (!record) {
      throw new NotFoundException(
        `Feature data unavailable for Panchayat ${panchayatId} on historical date ${requestedDate}. Available dates: 2023-01-01 to 2024-12-31.`,
      );
    }

    return record;
  }
}
