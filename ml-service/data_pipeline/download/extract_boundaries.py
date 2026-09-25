"""
extract_boundaries.py
Extracts real Gram Panchayat / village boundaries for Baramati Block, Pune District
from the DataMeet Maharashtra village collection (mh2.geojson).
"""

import json
import os
import sys
import urllib.request

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "raw", "boundaries")
OUTPUT_PATH = os.path.join(RAW_DIR, "baramati_panchayats_raw.geojson")
MH2_URL = "https://github.com/datameet/indian_village_boundaries/raw/master/mh/mh2.geojson"

# 15 Representative Gram Panchayats across western, central, and eastern Baramati Block
TARGET_PANCHAYATS = [
    "Baburdi",
    "Dorlewadi",
    "Gojubavi",
    "Gunwadi",
    "Hol",
    "Katewadi",
    "Katphal",
    "Khandaj",
    "Malegaon Bk",
    "Rui",
    "Songaon",
    "Shirsuphal",
    "Supa",
    "Vadgaon Nimbalkar",
    "Korhale Bk."  # Census representation of Korhale Budruk
]

def main():
    os.makedirs(RAW_DIR, exist_ok=True)
    print(f"[INFO] Streaming features from: {MH2_URL}")
    print(f"[INFO] Searching for District: Pune, Sub-District: Baramati...")

    req = urllib.request.Request(
        MH2_URL,
        headers={"User-Agent": "Panchayat-Weather-Intelligence/1.0"}
    )

    matching_features = []
    
    with urllib.request.urlopen(req) as resp:
        # mh2.geojson is structured as a top-level FeatureCollection
        # We read and parse features
        content = resp.read().decode("utf-8")
        data = json.loads(content)
        
        all_features = data.get("features", [])
        print(f"[INFO] Total features loaded in mh2: {len(all_features)}")

        for feat in all_features:
            props = feat.get("properties", {})
            dist = props.get("DISTRICT", "")
            sub_dist = props.get("SUB_DIST", "")
            name = props.get("NAME", "").strip()

            if dist.lower() == "pune" and sub_dist.lower() == "baramati":
                # Check if it matches our target set or is part of Baramati
                for target in TARGET_PANCHAYATS:
                    if target.lower() in name.lower() or name.lower() in target.lower():
                        # Standardize name tag
                        feat["properties"]["TARGET_NAME"] = target
                        matching_features.append(feat)
                        break

    # De-duplicate by target name
    unique_features = {}
    for feat in matching_features:
        t_name = feat["properties"]["TARGET_NAME"]
        if t_name not in unique_features:
            unique_features[t_name] = feat

    result_features = list(unique_features.values())
    print(f"[INFO] Successfully matched {len(result_features)} target Gram Panchayats in Baramati Block.")

    geojson_out = {
        "type": "FeatureCollection",
        "metadata": {
            "state": "Maharashtra",
            "district": "Pune",
            "sub_district": "Baramati",
            "source": "DataMeet Indian Village Boundaries (Census 2011)",
            "provenance": "https://github.com/datameet/indian_village_boundaries/raw/master/mh/mh2.geojson",
            "count": len(result_features)
        },
        "features": result_features
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(geojson_out, f, indent=2)

    print(f"[SUCCESS] Exported raw boundaries to: {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
