import csv
import time
import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

HEADERS = {
    "User-Agent": "MercerIslandHub/1.0 (derek.borden@misd400.org)"
}

VIEWBOX = "-122.255,47.590,-122.200,47.545"

def lookup_place(name: str, city: str = "Mercer Island", state: str = "WA"):
    params = {
        "q": f"{name}, {city}, {state}, USA",
        "format": "jsonv2",
        "limit": 1,
        "addressdetails": 1,
        "countrycodes": "us",
        "viewbox": VIEWBOX,
        "bounded": 1,
    }

    r = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=20)
    r.raise_for_status()
    results = r.json()

    if not results:
        return None

    place = results[0]
    address = place.get("address", {})

    street_parts = [address.get("house_number"), address.get("road")]
    street_address = " ".join(part for part in street_parts if part)

    return {
        "address": street_address or "",
        "city": address.get("city") or address.get("town") or address.get("village") or "",
        "state": address.get("state") or "",
        "zip": address.get("postcode") or "",
        "latitude": place.get("lat") or "",
        "longitude": place.get("lon") or "",
        "display_name": place.get("display_name", "")
    }

def enrich_csv(input_csv: str, output_csv: str):
    with open(input_csv, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)  # change delimiter=';' if needed
        print("Headers found:", reader.fieldnames)
        rows = list(reader)
        fieldnames = reader.fieldnames

    if not fieldnames:
        raise ValueError("No headers found in CSV.")

    for i, row in enumerate(rows, start=1):
        title = (row.get("title") or "").strip()

        if not title:
            print(f"Row {i}: missing title, skipping")
            continue

        if row.get("latitude") and row.get("longitude") and row.get("address"):
            print(f"Row {i}: {title} already filled, skipping")
            continue

        print(f"Looking up: {title}")
        result = lookup_place(title)

        if result:
            row["address"] = result["address"]
            row["city"] = result["city"]
            row["state"] = result["state"]
            row["zip"] = result["zip"]
            row["latitude"] = result["latitude"]
            row["longitude"] = result["longitude"]

            print(f"  Found: {result['display_name']}")
            print(f"  -> {result['address']} | {result['latitude']}, {result['longitude']}")
        else:
            print(f"  No match found for: {title}")

        time.sleep(1.1)  # Try not to overload the api (=

    with open(output_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    with open(input_csv, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        print("Headers:", reader.fieldnames)
        rows = list(reader)
        fieldnames = reader.fieldnames


if __name__ == "__main__":
    enrich_csv("/home/derekb/Documents/Git Repos/TSA-webapp/src/Dataset.csv", "/home/derekb/Documents/Git Repos/TSA-webapp/src/Dataset.csv")
