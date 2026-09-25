# Data Sources Documentation & Provenance Register

**Project**: Panchayat Weather Intelligence & Agro-Meteorological Advisory System  
**Study Area**: Baramati Block, Pune District, Maharashtra State, India  
**Scope**: Phase 2 — Study Area Selection, Real Data Ingestion & Dataset Design

---

## 1. Boundary Data Source

### Dataset: Maharashtra Village Boundaries (Census 2011 / 2001)
* **Provider / Origin**: DataMeet Community Open Maps Initiative ([DataMeet Indian Village Boundaries](http://projects.datameet.org/indian_village_boundaries/))
* **Official URL / Source**: `https://github.com/datameet/indian_village_boundaries/raw/master/mh/mh2.geojson`
* **Administrative Context**: Sourced from digitised Census of India 2011 village administrative boundaries and Maharashtra Remote Sensing Application Centre (MRSAC) base layers. Cross-referenced against the Ministry of Panchayati Raj Local Government Directory (LGD) for Baramati Block (LGD Sub-District Code: 4185; Pune District LGD Code: 492).
* **Role in Pipeline**: `BOUNDARY`
* **Classification**: **Open / Community Spatial Data (Not an official statutory government survey product)**
* **Spatial Resolution**: Polygon vector boundaries (individual revenue village / Gram Panchayat administrative units).
* **Coordinate Reference System (CRS)**: WGS 84 (`EPSG:4326`), coordinates in decimal degrees (latitude / longitude).
* **Geometry Type**: `Polygon` and `MultiPolygon`.
* **Attributes Recorded**:
  - `STATE`: "Maharashtra"
  - `DISTRICT`: "Pune"
  - `SUB_DIST`: "Baramati"
  - `NAME`: Village / Gram Panchayat name (e.g. Katewadi, Malegaon Bk, Supa, Dorlewadi)
  - `CEN_2001` / `CEN_2011`: Census administrative directory identification code
* **License**: Creative Commons Attribution-ShareAlike 2.5 India (CC BY-SA 2.5 IN) / Open Data Commons Open Database License (ODbL).
* **Known Limitations & Audit Notes**:
  - Boundaries reflect Census 2011 revenue village extents. While revenue village boundaries in rural Maharashtra closely coincide with Gram Panchayat jurisdictions, some Gram Panchayats govern multiple small hamlets (*wadis*), and recent municipal boundary expansions may marginally alter fringes.
  - Data is intended for research, modeling, and demonstration; official revenue disputes must consult Survey of India or Land Records Department (Bhumiobhilekh).

---

## 2. Coarse Block-Scale Historical Meteorological Input

### Dataset: NASA POWER Daily Agroclimatology (MERRA-2)
* **Provider**: NASA Langley Research Center / POWER Project (Prediction of Worldwide Energy Resources)
* **Official URL / Source**: `https://power.larc.nasa.gov/api/temporal/daily/point`
* **Role in Pipeline**: `INPUT` (Coarse-resolution historical weather input / block-scale proxy)
* **Classification**: **Reanalysis / Satellite-Assimilation Model Output (NOT operational forecast, NOT ground station observation)**
* **Spatial Resolution**: 0.5° latitude x 0.5° longitude (~50 km x ~50 km grid box, matching the spatial scale of an administrative Block/Taluka).
* **Temporal Resolution**: Daily aggregations (LST - Local Solar Time, Asia/Kolkata).
* **Variables Extracted**:
  - `PRECTOTCORR`: Precipitation Corrected (mm/day) $\rightarrow$ `block_rainfall`
  - `T2M`: Temperature at 2 Meters (°C) $\rightarrow$ `block_temperature`
  - `T2M_MAX`: Maximum Temperature at 2 Meters (°C) $\rightarrow$ `block_temp_max`
  - `T2M_MIN`: Minimum Temperature at 2 Meters (°C) $\rightarrow$ `block_temp_min`
  - `RH2M`: Relative Humidity at 2 Meters (%) $\rightarrow$ `block_humidity`
  - `WS2M`: Wind Speed at 2 Meters (m/s) $\rightarrow$ `block_wind_speed`
* **Extraction Coordinate**: Baramati Block geographic centroid (`Latitude: 18.1528° N, Longitude: 74.5772° E`).
* **Format**: REST API returning GeoJSON / Structured JSON.
* **License / Terms**: Public domain (NASA Open Data Policy).
* **Known Limitations**:
  - 0.5° resolution smooths out local convective precipitation peaks. In the semi-arid rain-shadow plateau of Pune district, localized convective cells can drop 40 mm in one village while an adjacent village receives 2 mm; a 0.5° cell reports an area-averaged ~8 mm.
  - In this historical spatial downscaling experiment, this product acts as a surrogate for the coarse numerical forecast that would be received from IMD's GFS/NCUM model during real-time operations.

---

## 3. High-Resolution Meteorological Reference Proxy

### Dataset: ERA5-Land Daily Reanalysis (Copernicus / Open-Meteo Archive)
* **Provider**: European Centre for Medium-Range Weather Forecasts (ECMWF) Copernicus Climate Change Service (C3S), served via Open-Meteo Historical Weather API.
* **Official URL / Source**: `https://archive-api.open-meteo.com/v1/archive`
* **Role in Pipeline**: `REFERENCE` & `TARGET` (`panchayat_rainfall_mm`)
* **Classification**: **High-Resolution Numerical Reanalysis (NOT ground station observation)**
* **Spatial Resolution**: 0.1° latitude x 0.1° longitude (~9 km x ~9 km grid box).
* **Temporal Resolution**: Daily aggregations (timezone: `Asia/Kolkata`).
* **Variables Extracted**:
  - `precipitation_sum`: Total daily precipitation (mm) $\rightarrow$ `target_rainfall` / `panchayat_rainfall_mm`
  - `temperature_2m_max`: Daily maximum 2-meter air temperature (°C)
  - `temperature_2m_min`: Daily minimum 2-meter air temperature (°C)
  - `temperature_2m_mean`: Daily mean 2-meter air temperature (°C)
  - `relative_humidity_2m_mean`: Daily mean relative humidity (%)
  - `wind_speed_10m_max`: Daily peak 10-meter wind speed (km/h)
* **Spatial Extraction Method**:
  - **Centroid Extraction**: Point extraction at each Panchayat's polygon centroid (`(lat_c, lon_c)`), sampling the nearest 0.1° ERA5-Land grid point.
  - *Methodological Limitation*: For very large Gram Panchayats, centroid sampling does not capture internal elevation variance. However, across the 15 selected Baramati Panchayats, the spatial distance between centroids spans from 5 km to 35 km, crossing multiple distinct 0.1° ERA5-Land grid cells, capturing realistic spatial gradients.
* **License / Terms**: Copernicus Open Access / Open-Meteo Non-Commercial Research Access.
* **Known Limitations**:
  - ERA5-Land is a physics-based land-surface model simulation driven by atmospheric forcing. While widely used in hydrological and meteorological benchmark research, it is NOT ground truth physical raingauge data. It serves as our objective high-resolution spatial reference for validating downscaling methodology.

---

## 4. Topographical & Geospatial Feature Sources

### Dataset: NASA Shuttle Radar Topography Mission (SRTM) 30m / Open-Elevation
* **Provider**: NASA / USGS / Open-Elevation REST API
* **Official URL / Source**: `https://api.open-elevation.com/api/v1/lookup` (backed by SRTM 1 Arc-Second Global elevation grid).
* **Role in Pipeline**: `FEATURE` (`elevation_m`)
* **Classification**: **Satellite Radar Digital Elevation Model (DEM)**
* **Spatial Resolution**: 1 arc-second (~30 meters).
* **Unit**: Meters above mean sea level (EGM96 vertical datum).
* **Feature Utility**: Topography and orographic lifting strongly influence rainfall distribution in western Maharashtra (Baramati transitions from higher western spurs at ~650m down to eastern Nira river basin plains at ~530m).

---

## 5. Dataset Summary Matrix

| Dataset | Provider | Spatial Res. | Temporal Res. | Type | Role | Truth Status |
|---|---|---|---|---|---|---|
| **DataMeet Village Maps** | DataMeet Community | Polygon Vector | Static (Census 2011) | Vector GeoJSON | `BOUNDARY` | Open Community GIS |
| **NASA POWER Daily** | NASA Langley | 0.5° (~50 km) | Daily | Gridded Reanalysis | `INPUT` | Coarse Reanalysis Input Proxy |
| **ERA5-Land Daily** | ECMWF / Open-Meteo | 0.1° (~9 km) | Daily | Gridded Reanalysis | `TARGET` / `REFERENCE` | Reference Proxy (Not Station Truth) |
| **SRTM Elevation** | NASA / USGS | 30 meters | Static | Raster DEM | `FEATURE` | Satellite Remote Sensing |
