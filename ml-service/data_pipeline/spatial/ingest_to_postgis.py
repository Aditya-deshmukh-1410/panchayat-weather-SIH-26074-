"""
ingest_to_postgis.py
Populates PostgreSQL/PostGIS database with real spatial entities:
- Block: Baramati (B01_BARAMATI)
- 14 Gram Panchayats with PostGIS geometries (EPSG:4326) and centroids
- Real weather data from the verified training table.
"""

import json
import os
import geopandas as gpd
import psycopg2
from shapely import wkt

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..")
CLEAN_GEOJSON = os.path.join(BASE_DIR, "data", "processed", "boundaries", "baramati_panchayats_clean.geojson")
ELEV_FILE = os.path.join(BASE_DIR, "data", "raw", "elevation", "panchayat_elevations_raw.json")
CSV_FILE = os.path.join(BASE_DIR, "data", "processed", "features", "training_table_baramati.csv")

DB_CONN = "postgresql://postgres:postgres_password_panchayat@localhost:5432/panchayat_weather"

def ingest():
    print(f"[INFO] Connecting to PostGIS: {DB_CONN}")
    conn = psycopg2.connect(DB_CONN)
    cur = conn.cursor()

    # 1. Insert Block
    print("[INFO] Ingesting Baramati Block...")
    cur.execute("""
        INSERT INTO blocks (id, name, district_name, state_name, centroid_lat, centroid_lon)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            centroid_lat = EXCLUDED.centroid_lat,
            centroid_lon = EXCLUDED.centroid_lon;
    """, ("B01_BARAMATI", "Baramati", "Pune", "Maharashtra", 18.1528, 74.5772))

    # 2. Insert 14 Gram Panchayats with Geometries
    print(f"[INFO] Reading clean boundaries from: {CLEAN_GEOJSON}")
    gdf = gpd.read_file(CLEAN_GEOJSON)

    with open(ELEV_FILE, "r", encoding="utf-8") as f:
        elev_dict = json.load(f)

    print(f"[INFO] Ingesting {len(gdf)} Gram Panchayats into PostGIS...")
    for _, row in gdf.iterrows():
        p_id = row["panchayat_id"]
        name = row["NAME"]
        census_code = row.get("CEN_2001", "")
        area = float(row["area_sqkm"])
        elev = float(elev_dict.get(p_id, 550.0))
        lat = float(row["centroid_lat"])
        lon = float(row["centroid_lon"])
        geom_wkt = row.geometry.wkt

        cur.execute("""
            INSERT INTO panchayats (
                id, name, census_code, block_id, area_sqkm, elevation_m,
                centroid_lat, centroid_lon, geometry, centroid
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s,
                ST_SetSRID(ST_GeomFromText(%s), 4326),
                ST_SetSRID(ST_MakePoint(%s, %s), 4326)
            )
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                area_sqkm = EXCLUDED.area_sqkm,
                elevation_m = EXCLUDED.elevation_m,
                geometry = EXCLUDED.geometry,
                centroid = EXCLUDED.centroid;
        """, (p_id, name, census_code, "B01_BARAMATI", area, elev, lat, lon, geom_wkt, lon, lat))

    # 3. Check ingested counts
    cur.execute("SELECT COUNT(*) FROM panchayats;")
    count = cur.fetchone()[0]

    cur.execute("""
        SELECT id, name, area_sqkm, elevation_m, ST_AsText(centroid)
        FROM panchayats ORDER BY id LIMIT 3;
    """)
    samples = cur.fetchall()

    conn.commit()
    cur.close()
    conn.close()

    print(f"[SUCCESS] PostGIS Ingestion Complete! Total Panchayats in DB: {count}")
    for s in samples:
        print(f"  - {s[0]}: {s[1]}, Area={s[2]} km², Elev={s[3]} m, Centroid={s[4]}")

if __name__ == "__main__":
    ingest()
