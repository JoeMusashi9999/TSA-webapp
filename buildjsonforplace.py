import csv
import json
from pathlib import Path
import re

INPUT_CSV = Path("./src/Dataset.csv")
OUTPUT_JSON = Path("./src/place.json")


def clean(value):
    return (value or "").strip()

def to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

def to_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None

def to_bool(value):
    return str(value).strip().lower() in ["true", "1", "yes"]

def split_tags(tag_string):
    raw = clean(tag_string).lower()
    if not raw:
        return []

    parts = re.split(r"[|,]", raw)
    seen = set()
    tags = []

    for tag in parts:
        t = tag.strip()
        if t and t not in seen:
            seen.add(t)
            tags.append(t)

    return tags

def generate_id(title, index):
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return f"{base}-{index:03d}" if base else f"place-{index:03d}"

def main():
    places = []

    with INPUT_CSV.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for i, row in enumerate(reader, start=1):
            title = clean(row.get("title"))
            if not title:
                continue

            place = {
                "id": clean(row.get("id")) or generate_id(title, i),
                "title": title,
                "category": clean(row.get("category")),
                "subcategory": clean(row.get("subcategory")),
                "description": clean(row.get("description")),
                "short_description": clean(row.get("short_description")),
                "tags": split_tags(row.get("tags")),
                "seasonal_tags": split_tags(row.get("seasonal_tags")),
                "review_keywords": split_tags(row.get("review_keywords")),
                "review_summary": clean(row.get("review_summary")),
                "rating_estimate": to_float(row.get("rating_estimate")),
                "review_count_estimate": to_int(row.get("review_count_estimate")),
                "address": clean(row.get("address")),
                "city": clean(row.get("city")),
                "state": clean(row.get("state")),
                "zip": clean(row.get("zip")),
                "latitude": to_float(row.get("latitude")),
                "longitude": to_float(row.get("longitude")),
                "website": clean(row.get("website")),
                "phone": clean(row.get("phone")),
                "image": clean(row.get("image")),
                "popularity_score": to_int(row.get("popularity_score")),
                "price_level": clean(row.get("price_level")),
                "family_friendly": to_bool(row.get("family_friendly")),
                "outdoor": to_bool(row.get("outdoor")),
                "hours": {
                    "sunday": clean(row.get("SUNDAYhours")),
                    "monday": clean(row.get("MONDAYhours")),
                    "tuesday": clean(row.get("TUESDAYhours")),
                    "wednesday": clean(row.get("WEDNESDAYhours")),
                    "thursday": clean(row.get("THURSDAYhours")),
                    "friday": clean(row.get("FRIDAYhours")),
                    "saturday": clean(row.get("SATURDAYhours")),
                },
            }

            places.append(place)

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_JSON.open("w", encoding="utf-8") as f:
        json.dump(places, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(places)} places → {OUTPUT_JSON}")

if __name__ == "__main__":
    main()