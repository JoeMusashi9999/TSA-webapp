import csv
import json
from pathlib import Path
import re



INPUT_CSV = Path("./src/Dataset.csv")
OUTPUT_JSON = Path("./src/directory.json")

# Fields the directory needs
KEEP_FIELDS = [
    "title",
    "category",
    "subcategory",
    "short_description",
    "tags",
    "website",
]

def clean(value: str) -> str:
    return (value or "").strip()

def split_tags(tag_string: str):
    raw = (tag_string or "").strip().lower()
    if not raw:
        return []
    # Split on commas OR pipes
    parts = re.split(r"[|,]", raw)
    seen = set()
    tags = []

    for tag in parts:
        t = tag.strip()
        if t and t not in seen:
            seen.add(t)
            tags.append(t)
    return tags

def main():
    places = []

    with INPUT_CSV.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            place = {
                "title": clean(row.get("title", "")),
                "category": clean(row.get("category", "")),
                "subcategory": clean(row.get("subcategory", "")),
                "short_description": clean(row.get("short_description", "")),
                "tags": split_tags(row.get("tags", "")),
                "website": clean(row.get("website", "")),
            }
            if not place["title"]:
                continue

            places.append(place)

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_JSON.open("w", encoding="utf-8") as f:
        json.dump(places, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(places)} places to {OUTPUT_JSON}")

if __name__ == "__main__":
    main()