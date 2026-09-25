-- Enable PostGIS spatial extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verification table to confirm migration runs
CREATE TABLE IF NOT EXISTS system_metadata (
    id SERIAL PRIMARY KEY,
    key VARCHAR(64) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_metadata (key, value)
VALUES ('postgis_initialized', 'true')
ON CONFLICT (key) DO UPDATE SET value = 'true', updated_at = CURRENT_TIMESTAMP;

-- Verification query check
DO $$
BEGIN
    RAISE NOTICE 'PostGIS Extension initialized successfully. Version: %', postgis_version();
END $$;
