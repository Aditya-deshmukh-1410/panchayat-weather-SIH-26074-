-- Phase 2 Study Area & Spatial Schema Migration
-- Defines entities for Blocks, Panchayats, Weather Observations, and Block Inputs

-- 1. Administrative Blocks Table
CREATE TABLE IF NOT EXISTS blocks (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    district_name VARCHAR(64) NOT NULL,
    state_name VARCHAR(64) NOT NULL,
    centroid_lat DOUBLE PRECISION NOT NULL,
    centroid_lon DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Gram Panchayats Table with PostGIS Geometry
CREATE TABLE IF NOT EXISTS panchayats (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    census_code VARCHAR(32),
    block_id VARCHAR(32) REFERENCES blocks(id) ON DELETE CASCADE,
    area_sqkm DOUBLE PRECISION NOT NULL,
    elevation_m DOUBLE PRECISION NOT NULL,
    centroid_lat DOUBLE PRECISION NOT NULL,
    centroid_lon DOUBLE PRECISION NOT NULL,
    geometry geometry(Geometry, 4326) NOT NULL,
    centroid geometry(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for fast geospatial boundary queries & point-in-polygon lookups
CREATE INDEX IF NOT EXISTS idx_panchayats_geometry ON panchayats USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_panchayats_centroid ON panchayats USING GIST (centroid);

-- 3. Block-Scale Weather Proxy / Forecast Input Table
CREATE TABLE IF NOT EXISTS block_weather_inputs (
    id SERIAL PRIMARY KEY,
    block_id VARCHAR(32) REFERENCES blocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    rainfall_mm DOUBLE PRECISION NOT NULL,
    temp_max DOUBLE PRECISION NOT NULL,
    temp_min DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION NOT NULL,
    wind_speed DOUBLE PRECISION NOT NULL,
    source VARCHAR(64) NOT NULL,
    UNIQUE (block_id, date)
);
CREATE INDEX IF NOT EXISTS idx_block_weather_date ON block_weather_inputs(date);

-- 4. Panchayat Reference Weather Observations Table
CREATE TABLE IF NOT EXISTS panchayat_weather_reference (
    id SERIAL PRIMARY KEY,
    panchayat_id VARCHAR(32) REFERENCES panchayats(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    rainfall_mm DOUBLE PRECISION NOT NULL,
    temp_max DOUBLE PRECISION NOT NULL,
    temp_min DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION NOT NULL,
    source VARCHAR(64) NOT NULL,
    UNIQUE (panchayat_id, date)
);
CREATE INDEX IF NOT EXISTS idx_panchayat_weather_lookup ON panchayat_weather_reference(panchayat_id, date);
