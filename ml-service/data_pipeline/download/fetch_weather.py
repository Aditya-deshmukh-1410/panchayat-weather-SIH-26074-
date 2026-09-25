"""
fetch_weather.py
Fetches authentic meteorological datasets and elevation data for Baramati Block
and the 14 validated Gram Panchayats.
- Coarse block input proxy: NASA POWER Daily Agroclimatology (0.5° grid)
- Reference weather proxy: ERA5-Land Daily Reanalysis (0.1° grid via Open-Meteo)
- Elevation: SRTM 30m / Open-Elevation API
"""

import json
import os
import sys
import time
import requests
import geopandas as gpd

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..")
CLEAN_GEOJSON = os.path.join(BASE_DIR, "data", "processed", "boundaries", "baramati_panchayats_clean.geojson")
RAW_WEATHER_DIR = os.path.join(BASE_DIR, "data", "raw", "weather")
RAW_ELEV_DIR = os.path.join(BASE_DIR, "data", "raw", "elevation")

# Common date range for the study: 2 full calendar/agricultural years (731 days)
START_DATE = "2023-01-01"
END_DATE = "2024-12-31"

# Baramati Block Geographic Centroid
BLOCK_CENTROID_LAT = 18.1528
BLOCK_CENTROID_LON = 74.5772

def fetch_nasa_power_block(start_date, end_date):
    """
    Fetches coarse 0.5° historical weather from NASA POWER at the Block centroid.
    Acts as the coarse-resolution historical weather input / block-scale proxy.
    """
    s_clean = start_date.replace("-", "")
    e_clean = end_date.replace("-", "")
    url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"parameters=PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,RH2M,WS2M&"
        f"community=AG&longitude={BLOCK_CENTROID_LON}&latitude={BLOCK_CENTROID_LAT}&"
        f"start={s_clean}&end={e_clean}&format=JSON"
    )
    print(f"[INFO] Fetching coarse block-scale proxy from NASA POWER: {url}")
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    out_path = os.path.join(RAW_WEATHER_DIR, "nasa_power_baramati_block_raw.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"[SUCCESS] Saved NASA POWER block raw data to: {out_path}")
    return data

def fetch_era5_land_panchayats(gdf, start_date, end_date):
    """
    Fetches high-resolution (0.1°) ERA5-Land daily reanalysis for each of the 14 Panchayat centroids.
    Acts as the Panchayat-level reference proxy (NOT ground station truth).
    """
    all_panchayat_weather = {}

    for _, row in gdf.iterrows():
        p_id = row["panchayat_id"]
        name = row["NAME"]
        lat = row["centroid_lat"]
        lon = row["centroid_lon"]

        url = (
            f"https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={lat}&longitude={lon}&start_date={start_date}&end_date={end_date}&"
            f"daily=precipitation_sum,temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean,wind_speed_10m_max&"
            f"timezone=Asia%2FKolkata"
        )
        print(f"[INFO] Fetching ERA5-Land for {p_id} ({name}) at ({lat}, {lon})...")
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        weather_json = resp.json()
        all_panchayat_weather[p_id] = {
            "panchayat_id": p_id,
            "name": name,
            "latitude": lat,
            "longitude": lon,
            "data": weather_json
        }
        # Respect rate limits
        time.sleep(0.3)

    out_path = os.path.join(RAW_WEATHER_DIR, "era5_land_panchayats_raw.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_panchayat_weather, f, indent=2)
    print(f"[SUCCESS] Saved ERA5-Land data for {len(all_panchayat_weather)} Panchayats to: {out_path}")
    return all_panchayat_weather

def fetch_elevations(gdf, era5_data=None):
    """
    Extracts authentic surface DEM elevations for the 14 Panchayat centroids.
    Uses the elevation attribute returned by Copernicus/Open-Meteo in the ERA5 payload.
    """
    elevations = {}

    if era5_data is None:
        era5_path = os.path.join(RAW_WEATHER_DIR, "era5_land_panchayats_raw.json")
        if os.path.exists(era5_path):
            with open(era5_path, "r", encoding="utf-8") as f:
                era5_data = json.load(f)

    if era5_data:
        for p_id, item in era5_data.items():
            elev = item.get("data", {}).get("elevation")
            if elev is not None:
                elevations[p_id] = float(elev)

    out_path = os.path.join(RAW_ELEV_DIR, "panchayat_elevations_raw.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(elevations, f, indent=2)
    print(f"[SUCCESS] Extracted and saved elevations for {len(elevations)} Panchayats to: {out_path}")
    return elevations

def main():
    os.makedirs(RAW_WEATHER_DIR, exist_ok=True)
    os.makedirs(RAW_ELEV_DIR, exist_ok=True)

    print(f"[INFO] Reading processed Panchayats from: {CLEAN_GEOJSON}")
    gdf = gpd.read_file(CLEAN_GEOJSON)

    nasa_path = os.path.join(RAW_WEATHER_DIR, "nasa_power_baramati_block_raw.json")
    era5_path = os.path.join(RAW_WEATHER_DIR, "era5_land_panchayats_raw.json")

    # 1. Fetch Block coarse historical proxy if missing
    if not os.path.exists(nasa_path) or os.path.getsize(nasa_path) < 1000:
        fetch_nasa_power_block(START_DATE, END_DATE)
    else:
        print(f"[INFO] Using existing NASA POWER data: {nasa_path}")

    # 2. Fetch Panchayat-level ERA5-Land reference proxy if missing
    if not os.path.exists(era5_path) or os.path.getsize(era5_path) < 1000:
        fetch_era5_land_panchayats(gdf, START_DATE, END_DATE)
    else:
        print(f"[INFO] Using existing ERA5-Land data: {era5_path}")

    # 3. Fetch Topography (Elevation)
    fetch_elevations(gdf)

    print("[SUCCESS] All raw meteorological and spatial datasets fetched successfully.")

if __name__ == "__main__":
    main()
