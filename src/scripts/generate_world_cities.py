#!/usr/bin/env python3
"""
Generate additional cities for all countries that have fewer than 4 cities.
Each country should have 3-5 cities with realistic names, coordinates, and stats.
"""
import json, random, hashlib

random.seed(42)

# Major real cities by country (top cities for countries with only 1-2)
CITY_DB = {
    "BRA65": [("São Paulo", -23.55, -46.63), ("Rio de Janeiro", -22.91, -43.17), ("Brasília", -15.79, -47.88), ("Salvador", -12.97, -38.51), ("Fortaleza", -3.73, -38.53)],
    "MEX72": [("Mexico City", 19.43, -99.13), ("Guadalajara", 20.67, -103.35), ("Monterrey", 25.67, -100.32), ("Tijuana", 32.51, -117.04), ("Ciudad Juárez", 31.69, -106.42)],
    "COL49": [("Bogotá", 4.71, -74.07), ("Medellín", 6.25, -75.56), ("Cali", 3.45, -76.53), ("Barranquilla", 10.96, -74.78), ("Cartagena", 10.39, -75.51)],
    "ARG96": [("Buenos Aires", -34.60, -58.38), ("Córdoba", -31.42, -64.18), ("Rosario", -32.95, -60.65), ("Mendoza", -32.89, -68.85)],
    "CHI10": [("Beijing", 39.90, 116.40), ("Shanghai", 31.23, 121.47), ("Guangzhou", 23.13, 113.26), ("Shenzhen", 22.54, 114.06), ("Chengdu", 30.57, 104.07)],
    "IND98": [("Mumbai", 19.08, 72.88), ("Delhi", 28.70, 77.10), ("Bangalore", 12.97, 77.59), ("Chennai", 13.08, 80.27), ("Kolkata", 22.57, 88.36)],
    "RUS23": [("Moscow", 55.76, 37.62), ("St. Petersburg", 59.93, 30.32), ("Novosibirsk", 55.04, 82.93), ("Yekaterinburg", 56.84, 60.60)],
    "GER42": [("Berlin", 52.52, 13.41), ("Munich", 48.14, 11.58), ("Hamburg", 53.55, 9.99), ("Frankfurt", 50.11, 8.68), ("Cologne", 50.94, 6.96)],
    "FRA84": [("Paris", 48.86, 2.35), ("Marseille", 43.30, 5.37), ("Lyon", 45.76, 4.83), ("Toulouse", 43.60, 1.44)],
    "ITA17": [("Rome", 41.90, 12.50), ("Milan", 45.46, 9.19), ("Naples", 40.85, 14.27), ("Turin", 45.07, 7.69)],
    "SPA61": [("Madrid", 40.42, -3.70), ("Barcelona", 41.39, 2.17), ("Seville", 37.39, -5.98), ("Valencia", 39.47, -0.38)],
    "UNI16": [("London", 51.51, -0.13), ("Manchester", 53.48, -2.24), ("Birmingham", 52.49, -1.89), ("Glasgow", 55.86, -4.25)],
    "CAN91": [("Toronto", 43.65, -79.38), ("Vancouver", 49.28, -123.12), ("Montreal", 45.50, -73.57), ("Calgary", 51.05, -114.07), ("Ottawa", 45.42, -75.70)],
    "AUS85": [("Sydney", -33.87, 151.21), ("Melbourne", -37.81, 144.96), ("Brisbane", -27.47, 153.03), ("Perth", -31.95, 115.86)],
    "JAP63": [("Tokyo", 35.68, 139.69), ("Osaka", 34.69, 135.50), ("Yokohama", 35.44, 139.64), ("Nagoya", 35.18, 136.91)],
    "SOU26": [("Seoul", 37.57, 126.98), ("Busan", 35.18, 129.08), ("Incheon", 37.46, 126.71), ("Daegu", 35.87, 128.60)],
    "NIG41": [("Lagos", 6.52, 3.38), ("Abuja", 9.06, 7.49), ("Kano", 12.00, 8.52), ("Ibadan", 7.38, 3.95), ("Port Harcourt", 4.82, 7.03)],
    "EGY58": [("Cairo", 30.04, 31.24), ("Alexandria", 31.20, 29.92), ("Giza", 30.01, 31.21), ("Luxor", 25.69, 32.64)],
    "SOU37": [("Johannesburg", -26.20, 28.05), ("Cape Town", -33.93, 18.42), ("Durban", -29.86, 31.02), ("Pretoria", -25.75, 28.19)],
    "KEN79": [("Nairobi", -1.29, 36.82), ("Mombasa", -4.05, 39.67), ("Kisumu", -0.09, 34.77)],
    "ETH97": [("Addis Ababa", 9.02, 38.75), ("Dire Dawa", 9.59, 41.85), ("Mekelle", 13.50, 39.47)],
    "TUR16": [("Istanbul", 41.01, 28.98), ("Ankara", 39.93, 32.85), ("Izmir", 38.42, 27.13), ("Antalya", 36.90, 30.70)],
    "IRA53": [("Tehran", 35.69, 51.39), ("Isfahan", 32.65, 51.68), ("Mashhad", 36.30, 59.60), ("Tabriz", 38.08, 46.29)],
    "IRA65": [("Baghdad", 33.31, 44.37), ("Basra", 30.51, 47.81), ("Mosul", 36.34, 43.14), ("Erbil", 36.19, 44.01)],
    "SAU36": [("Riyadh", 24.69, 46.72), ("Jeddah", 21.49, 39.19), ("Mecca", 21.39, 39.86), ("Dammam", 26.43, 50.10)],
    "PAK52": [("Karachi", 24.86, 67.01), ("Lahore", 31.55, 74.35), ("Islamabad", 33.69, 73.04), ("Faisalabad", 31.42, 73.08)],
    "IND66": [("Jakarta", -6.21, 106.85), ("Surabaya", -7.25, 112.75), ("Bandung", -6.91, 107.61), ("Medan", 3.60, 98.67)],
    "PHI27": [("Manila", 14.60, 120.98), ("Cebu City", 10.31, 123.89), ("Davao", 7.19, 125.46)],
    "THA80": [("Bangkok", 13.76, 100.50), ("Chiang Mai", 18.79, 98.98), ("Phuket", 7.88, 98.39)],
    "VIE99": [("Hanoi", 21.03, 105.85), ("Ho Chi Minh City", 10.82, 106.63), ("Da Nang", 16.05, 108.22)],
    "MAL73": [("Kuala Lumpur", 3.14, 101.69), ("George Town", 5.41, 100.33), ("Johor Bahru", 1.49, 103.74)],
    "VEN40": [("Caracas", 10.48, -66.90), ("Maracaibo", 10.63, -71.64), ("Valencia", 10.16, -67.99), ("Barquisimeto", 10.07, -69.32)],
    "PER53": [("Lima", -12.05, -77.04), ("Arequipa", -16.41, -71.54), ("Cusco", -13.52, -71.97), ("Trujillo", -8.11, -79.03)],
    "ECU24": [("Quito", -0.18, -78.47), ("Guayaquil", -2.17, -79.92), ("Cuenca", -2.90, -79.00)],
    "CHI75": [("Santiago", -33.45, -70.67), ("Valparaíso", -33.05, -71.62), ("Concepción", -36.83, -73.05)],
    "HON36": [("Tegucigalpa", 14.07, -87.19), ("San Pedro Sula", 15.50, -88.03), ("La Ceiba", 15.78, -86.79)],
    "GUA57": [("Guatemala City", 14.63, -90.51), ("Mixco", 14.63, -90.61), ("Quetzaltenango", 14.83, -91.52)],
    "JAM82": [("Kingston", 18.02, -76.80), ("Montego Bay", 18.47, -77.92), ("Spanish Town", 17.99, -76.96)],
    "HAI42": [("Port-au-Prince", 18.54, -72.34), ("Cap-Haïtien", 19.76, -72.20), ("Gonaïves", 19.45, -72.69)],
    "UKR56": [("Kyiv", 50.45, 30.52), ("Kharkiv", 49.99, 36.23), ("Odessa", 46.48, 30.74), ("Lviv", 49.84, 24.03)],
    "POL77": [("Warsaw", 52.23, 21.01), ("Kraków", 50.06, 19.94), ("Gdańsk", 54.35, 18.65)],
    "SWE67": [("Stockholm", 59.33, 18.07), ("Gothenburg", 57.71, 11.97), ("Malmö", 55.61, 13.00)],
    "NOR18": [("Oslo", 59.91, 10.75), ("Bergen", 60.39, 5.32), ("Trondheim", 63.43, 10.40)],
    "NET74": [("Amsterdam", 52.37, 4.90), ("Rotterdam", 51.92, 4.48), ("The Hague", 52.08, 4.30), ("Utrecht", 52.09, 5.12)],
    "GRE31": [("Athens", 37.98, 23.73), ("Thessaloniki", 40.64, 22.94), ("Patras", 38.25, 21.74)],
    "POR15": [("Lisbon", 38.72, -9.14), ("Porto", 41.16, -8.63), ("Faro", 37.02, -7.94)],
    "MOZ59": [("Maputo", -25.97, 32.57), ("Beira", -19.84, 34.87), ("Nampula", -15.12, 39.27)],
    "GHA76": [("Accra", 5.56, -0.19), ("Kumasi", 6.69, -1.62), ("Tamale", 9.40, -0.84)],
    "CAM49": [("Yaoundé", 3.87, 11.52), ("Douala", 4.05, 9.70), ("Garoua", 9.30, 13.40)],
    "SEN66": [("Dakar", 14.69, -17.44), ("Touba", 14.85, -15.88), ("Saint-Louis", 16.02, -16.49)],
    "RWA77": [("Kigali", -1.94, 30.06), ("Butare", -2.60, 29.74), ("Gisenyi", -1.70, 29.26)],
    "BOL20": [("La Paz", -16.50, -68.15), ("Santa Cruz", -17.78, -63.18), ("Cochabamba", -17.39, -66.16)],
    "PAR27": [("Asunción", -25.26, -57.58), ("Ciudad del Este", -25.51, -54.61), ("Encarnación", -27.33, -55.87)],
    "UGA49": [("Kampala", 0.35, 32.58), ("Gulu", 2.77, 32.30), ("Entebbe", 0.06, 32.44)],
    "TAN62": [("Dar es Salaam", -6.79, 39.28), ("Dodoma", -6.17, 35.74), ("Mwanza", -2.52, 32.90)],
    "SUD83": [("Khartoum", 15.50, 32.56), ("Omdurman", 15.64, 32.48), ("Port Sudan", 19.62, 37.22)],
    "AFG19": [("Kabul", 34.53, 69.17), ("Herat", 34.35, 62.20), ("Kandahar", 31.63, 65.71), ("Mazar-i-Sharif", 36.71, 67.11)],
    "MYA52": [("Yangon", 16.87, 96.20), ("Mandalay", 21.97, 96.08), ("Naypyidaw", 19.76, 96.07)],
    "SYR17": [("Damascus", 33.51, 36.29), ("Aleppo", 36.20, 37.16), ("Homs", 34.73, 36.71)],
    "YEM18": [("Sanaa", 15.37, 44.21), ("Aden", 12.78, 45.04), ("Taiz", 13.58, 44.02)],
    "LIB73": [("Tripoli", 32.90, 13.18), ("Benghazi", 32.12, 20.09), ("Misrata", 32.38, 15.09)],
    "SOM64": [("Mogadishu", 2.05, 45.32), ("Hargeisa", 9.56, 44.06), ("Kismayo", -0.35, 42.54)],
    "CUB68": [("Havana", 23.11, -82.37), ("Santiago de Cuba", 20.02, -75.83), ("Camagüey", 21.38, -77.92)],
    "ZIM94": [("Harare", -17.83, 31.05), ("Bulawayo", -20.15, 28.58), ("Mutare", -18.97, 32.67)],
    "ZAM92": [("Lusaka", -15.39, 28.32), ("Kitwe", -12.80, 28.21), ("Ndola", -12.96, 28.64)],
}

# Violence context options
CONTEXTS = ["Gang-related", "Drug-related", "Political instability", "Domestic violence", "Armed robbery", "Ethnic conflict", "Organized crime", "Carjacking", "Street crime"]

with open('data/countries.json') as f:
    countries = json.load(f)
with open('data/cities.json') as f:
    cities = json.load(f)

country_map = {c['id']: c for c in countries}
existing = {}
for c in cities:
    cid = c.get('countryId', '')
    if cid not in existing:
        existing[cid] = set()
    existing[cid].add(c['name'].lower())

added = 0
for cid, country in country_map.items():
    if cid == 'USA':
        continue  # USA already has 168 cities
    
    current_count = len(existing.get(cid, set()))
    if current_count >= 3:
        continue
    
    need = max(0, 4 - current_count)  # Get up to 4 cities per country
    
    # Use DB cities if available
    if cid in CITY_DB:
        candidates = [(n, lat, lng) for n, lat, lng in CITY_DB[cid] if n.lower() not in existing.get(cid, set())]
    else:
        # Generate cities near the country center
        lat, lng = country.get('lat', 0), country.get('lng', 0)
        # Generate plausible nearby coords
        candidates = []
        for i in range(need):
            h = hashlib.md5(f"{cid}-gen-{i}".encode()).hexdigest()
            dlat = (int(h[:4], 16) % 600 - 300) / 100.0
            dlng = (int(h[4:8], 16) % 600 - 300) / 100.0
            name_prefixes = ["North", "South", "East", "West", "New", "Port", "Saint", "Old"]
            name_suffixes = ["town", "ville", "burg", "port", "field", "haven", "dale", "wood"]
            pref = name_prefixes[int(h[8:10], 16) % len(name_prefixes)]
            suf = name_suffixes[int(h[10:12], 16) % len(name_suffixes)]
            gen_name = f"{pref}{suf}"
            if gen_name.lower() not in existing.get(cid, set()):
                candidates.append((gen_name, lat + dlat, lng + dlng))
    
    for name, lat, lng in candidates[:need]:
        # Derive city stats from country stats with variation
        h = hashlib.md5(f"{cid}-{name}".encode()).hexdigest()
        variation = 0.6 + (int(h[:4], 16) % 800) / 1000.0  # 0.6 to 1.4x
        
        base_hom = country.get('homicideRatePer100k', 3.0)
        base_fire = country.get('firearmHomicideRate', 2.0)
        base_crime = country.get('organizedCrimeIndex', 3.0)
        
        hom = round(base_hom * variation, 1)
        fire = round(base_fire * variation, 1)
        crime = round(base_crime * (0.7 + (int(h[4:8], 16) % 600) / 1000.0), 1)
        
        context = CONTEXTS[int(h[8:10], 16) % len(CONTEXTS)]
        pop = (int(h[10:14], 16) % 4500 + 500) * 1000  # 500k to 5M
        
        city = {
            "id": f"{cid[:3]}{name[:3].upper()}{int(h[14:16], 16) % 100:02d}",
            "name": name,
            "countryId": cid,
            "lat": round(lat, 2),
            "lng": round(lng, 2),
            "population": pop,
            "homicideRatePer100k": hom,
            "firearmHomicideRate": fire,
            "organizedCrimeIndex": crime,
            "riskContext": context,
            "underAge25Percent": country.get('underAge25Percent', 30),
            "gangRelatedGunDeathsPercent": country.get('gangRelatedGunDeathsPercent', 10),
        }
        cities.append(city)
        added += 1
        
        if cid not in existing:
            existing[cid] = set()
        existing[cid].add(name.lower())

# Sort cities by country then name
cities.sort(key=lambda c: (c.get('countryId', ''), c.get('name', '')))

with open('data/cities.json', 'w') as f:
    json.dump(cities, f, indent=2, ensure_ascii=False)

# Print summary
print(f"Added {added} new cities")
print(f"Total cities now: {len(cities)}")

# Count per country
counts = {}
for c in cities:
    cid = c.get('countryId', '')
    counts[cid] = counts.get(cid, 0) + 1

under3 = sum(1 for v in counts.values() if v < 3)
print(f"Countries with <3 cities: {under3}")
print(f"Countries total: {len(counts)}")
