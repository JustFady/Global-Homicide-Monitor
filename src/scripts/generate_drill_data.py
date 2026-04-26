#!/usr/bin/env python3
"""Generate drill-down data: add lat/lng to states, stateId to cities, generate missing cities."""
import json, random, copy

random.seed(42)

# ── State center coordinates ──────────────────────────────────
STATE_COORDS = {
    "Alabama": (32.806671, -86.791130),
    "Alaska": (61.370716, -152.404419),
    "Arizona": (33.729759, -111.431221),
    "Arkansas": (34.969704, -92.373123),
    "California": (36.116203, -119.681564),
    "Colorado": (39.059811, -105.311104),
    "Connecticut": (41.597782, -72.755371),
    "Delaware": (39.318523, -75.507141),
    "Florida": (27.766279, -81.686783),
    "Georgia": (33.040619, -83.643074),
    "Hawaii": (21.094318, -157.498337),
    "Idaho": (44.240459, -114.478828),
    "Illinois": (40.349457, -88.986137),
    "Indiana": (39.849426, -86.258278),
    "Iowa": (42.011539, -93.210526),
    "Kansas": (38.526600, -96.726486),
    "Kentucky": (37.668140, -84.670067),
    "Louisiana": (31.169546, -91.867805),
    "Maine": (44.693947, -69.381927),
    "Maryland": (39.063946, -76.802101),
    "Massachusetts": (42.230171, -71.530106),
    "Michigan": (43.326618, -84.536095),
    "Minnesota": (45.694454, -93.900192),
    "Mississippi": (32.741646, -89.678696),
    "Missouri": (38.456085, -92.288368),
    "Montana": (46.921925, -110.454353),
    "Nebraska": (41.125370, -98.268082),
    "Nevada": (38.313515, -117.055374),
    "New Hampshire": (43.452492, -71.563896),
    "New Jersey": (40.298904, -74.521011),
    "New Mexico": (34.840515, -106.248482),
    "New York": (42.165726, -74.948051),
    "North Carolina": (35.630066, -79.806419),
    "North Dakota": (47.528912, -99.784012),
    "Ohio": (40.388783, -82.764915),
    "Oklahoma": (35.565342, -96.928917),
    "Oregon": (44.572021, -122.070938),
    "Pennsylvania": (40.590752, -77.209755),
    "Rhode Island": (41.680893, -71.511780),
    "South Carolina": (33.856892, -80.945007),
    "South Dakota": (44.299782, -99.438828),
    "Tennessee": (35.747845, -86.692345),
    "Texas": (31.054487, -97.563461),
    "Utah": (40.150032, -111.862434),
    "Vermont": (44.045876, -72.710686),
    "Virginia": (37.769337, -78.169968),
    "Washington": (47.400902, -121.490494),
    "West Virginia": (38.491226, -80.954453),
    "Wisconsin": (44.268543, -89.616508),
    "Wyoming": (42.755966, -107.302490),
    "District of Columbia": (38.907192, -77.036871),
    "Puerto Rico": (18.220833, -66.590149),
}

# ── Mapping existing cities to their states ───────────────────
CITY_TO_STATE = {
    "Chicago": "USA-ILLINOIS",
    "Baltimore": "USA-MARYLAND",
    "St. Louis": "USA-MISSOURI",
    "New Orleans": "USA-LOUISIANA",
    "Detroit": "USA-MICHIGAN",
    "Memphis": "USA-TENNESSEE",
    "Philadelphia": "USA-PENNSYLVANIA",
    "Houston": "USA-TEXAS",
    "Los Angeles": "USA-CALIFORNIA",
    "New York City": "USA-NEW YORK",
    "San Antonio": "USA-TEXAS",
    "Milwaukee": "USA-WISCONSIN",
}

# ── State law summaries ───────────────────────────────────────
LAW_SUMMARIES = {
    "Permissive": [
        "This state has minimal restrictions on firearm ownership, with no permit required for purchase or carry. Constitutional carry is in effect.",
        "Firearm regulations are among the least restrictive in the nation. No waiting periods, no universal background checks, and open carry is legal without a permit.",
        "Gun laws favor broad access. No registration, no assault weapons ban, and concealed carry permits are shall-issue with minimal requirements.",
    ],
    "Moderate": [
        "This state maintains a balanced approach with some restrictions including background checks on all sales and a permit required for concealed carry.",
        "Moderate gun regulations are in place, including waiting periods for handgun purchases and red flag laws allowing temporary firearm removal.",
        "A mix of permissive and restrictive policies. Universal background checks are required but open carry remains legal with a permit.",
    ],
    "Strict": [
        "This state enforces comprehensive firearm regulations including mandatory waiting periods, universal background checks, assault weapons bans, and may-issue concealed carry permits.",
        "Among the strictest gun laws in the nation. Magazine capacity limits, assault weapons bans, and extensive licensing requirements are enforced.",
        "Rigorous firearm legislation includes red flag laws, mandatory safety training, registration requirements, and strict concealed carry permitting.",
    ],
}

# ── City templates for generation ─────────────────────────────
VIOLENCE_TYPES = ["Gang-related", "Interpersonal", "Domestic", "Organized Crime", "Drug-related"]

CITY_TEMPLATES = {
    "Alabama": [("Birmingham", 33.5207, -86.8025, 200733), ("Huntsville", 34.7304, -86.5861, 215006), ("Mobile", 30.6954, -88.0399, 187041)],
    "Alaska": [("Anchorage", 61.2181, -149.9003, 291247), ("Fairbanks", 64.8378, -147.7164, 32325), ("Juneau", 58.3005, -134.4197, 32255)],
    "Arizona": [("Phoenix", 33.4484, -112.0740, 1608139), ("Tucson", 32.2226, -110.9747, 542629), ("Mesa", 33.4152, -111.8315, 504258)],
    "Arkansas": [("Little Rock", 34.7465, -92.2896, 202591), ("Fort Smith", 35.3859, -94.3985, 89142), ("Fayetteville", 36.0626, -94.1574, 93949)],
    "California": [("Oakland", 37.8044, -122.2712, 433031), ("Fresno", 36.7378, -119.7871, 542107), ("Stockton", 37.9577, -121.2908, 320804)],
    "Colorado": [("Denver", 39.7392, -104.9903, 715522), ("Colorado Springs", 38.8339, -104.8214, 478961), ("Aurora", 39.7294, -104.8319, 386261)],
    "Connecticut": [("Hartford", 41.7658, -72.6734, 121054), ("New Haven", 41.3083, -72.9279, 134023), ("Bridgeport", 41.1865, -73.1952, 148529)],
    "Delaware": [("Wilmington", 39.7391, -75.5398, 70851), ("Dover", 39.1582, -75.5244, 39403), ("Newark", 39.6837, -75.7497, 33042)],
    "Florida": [("Jacksonville", 30.3322, -81.6557, 949611), ("Miami", 25.7617, -80.1918, 442241), ("Orlando", 28.5383, -81.3792, 307573)],
    "Georgia": [("Atlanta", 33.7490, -84.3880, 498715), ("Savannah", 32.0809, -81.0912, 147780), ("Augusta", 33.4735, -82.0105, 202081)],
    "Hawaii": [("Honolulu", 21.3069, -157.8583, 350964), ("Hilo", 19.7241, -155.0868, 45703), ("Kailua", 21.4022, -157.7394, 40514)],
    "Idaho": [("Boise", 43.6150, -116.2023, 235684), ("Meridian", 43.6121, -116.3915, 117635), ("Nampa", 43.5407, -116.5635, 100200)],
    "Illinois": [("Springfield", 39.7817, -89.6501, 114394), ("Rockford", 42.2711, -89.0940, 148655), ("Peoria", 40.6936, -89.5890, 113150)],
    "Indiana": [("Indianapolis", 39.7684, -86.1581, 887642), ("Fort Wayne", 41.0793, -85.1394, 263886), ("Evansville", 37.9716, -87.5711, 117429)],
    "Iowa": [("Des Moines", 41.5868, -93.6250, 214237), ("Cedar Rapids", 41.9779, -91.6656, 137710), ("Davenport", 41.5236, -90.5776, 101590)],
    "Kansas": [("Wichita", 37.6872, -97.3301, 397532), ("Kansas City", 39.1142, -94.6275, 156607), ("Topeka", 39.0489, -95.6780, 126587)],
    "Kentucky": [("Louisville", 38.2527, -85.7585, 633045), ("Lexington", 38.0406, -84.5037, 322570), ("Bowling Green", 36.9685, -86.4808, 78803)],
    "Louisiana": [("Baton Rouge", 30.4515, -91.1871, 227470), ("Shreveport", 32.5252, -93.7502, 187593), ("Lafayette", 30.2241, -92.0198, 121374)],
    "Maine": [("Portland", 43.6591, -70.2568, 68408), ("Lewiston", 44.1004, -70.2148, 37121), ("Bangor", 44.8016, -68.7712, 31903)],
    "Maryland": [("Annapolis", 38.9784, -76.4922, 40812), ("Frederick", 39.4143, -77.4105, 78171), ("Rockville", 39.0840, -77.1528, 68401)],
    "Massachusetts": [("Boston", 42.3601, -71.0589, 675647), ("Worcester", 42.2626, -71.8023, 206518), ("Springfield", 42.1015, -72.5898, 155929)],
    "Michigan": [("Grand Rapids", 42.9634, -85.6681, 198917), ("Flint", 43.0125, -83.6875, 97310), ("Lansing", 42.7325, -84.5555, 112644)],
    "Minnesota": [("Minneapolis", 44.9778, -93.2650, 429954), ("Saint Paul", 44.9537, -93.0900, 311527), ("Rochester", 44.0121, -92.4802, 121395)],
    "Mississippi": [("Jackson", 32.2988, -90.1848, 153701), ("Gulfport", 30.3674, -89.0928, 72926), ("Hattiesburg", 31.3271, -89.2903, 46805)],
    "Missouri": [("Kansas City", 39.0997, -94.5786, 508090), ("Springfield", 37.2090, -93.2923, 169176), ("Columbia", 38.9517, -92.3341, 126254)],
    "Montana": [("Billings", 45.7833, -108.5007, 119798), ("Missoula", 46.8721, -114.0000, 75516), ("Great Falls", 47.5002, -111.3008, 60442)],
    "Nebraska": [("Omaha", 41.2565, -95.9345, 486051), ("Lincoln", 40.8136, -96.7026, 291082), ("Bellevue", 41.1544, -95.8908, 64176)],
    "Nevada": [("Las Vegas", 36.1699, -115.1398, 641903), ("Reno", 39.5296, -119.8138, 264165), ("Henderson", 36.0395, -114.9817, 320189)],
    "New Hampshire": [("Manchester", 42.9956, -71.4548, 115644), ("Nashua", 42.7654, -71.4676, 91322), ("Concord", 43.2081, -71.5376, 43976)],
    "New Jersey": [("Newark", 40.7357, -74.1724, 311549), ("Jersey City", 40.7282, -74.0776, 292449), ("Trenton", 40.2206, -74.7563, 90871)],
    "New Mexico": [("Albuquerque", 35.0844, -106.6504, 564559), ("Las Cruces", 32.3199, -106.7637, 111385), ("Santa Fe", 35.6870, -105.9378, 87505)],
    "New York": [("Buffalo", 42.8864, -78.8784, 278349), ("Rochester", 43.1566, -77.6088, 211328), ("Syracuse", 43.0481, -76.1474, 148620)],
    "North Carolina": [("Charlotte", 35.2271, -80.8431, 874579), ("Raleigh", 35.7796, -78.6382, 467665), ("Durham", 35.9940, -78.8986, 283506)],
    "North Dakota": [("Fargo", 46.8772, -96.7898, 125990), ("Bismarck", 46.8083, -100.7837, 73529), ("Grand Forks", 47.9253, -97.0329, 56588)],
    "Ohio": [("Columbus", 39.9612, -82.9988, 905748), ("Cleveland", 41.4993, -81.6944, 372624), ("Cincinnati", 39.1031, -84.5120, 309317)],
    "Oklahoma": [("Oklahoma City", 35.4676, -97.5164, 681054), ("Tulsa", 36.1540, -95.9928, 413066), ("Norman", 35.2226, -97.4395, 128026)],
    "Oregon": [("Portland", 45.5152, -122.6784, 652503), ("Salem", 44.9429, -123.0351, 174365), ("Eugene", 44.0521, -123.0868, 176654)],
    "Pennsylvania": [("Pittsburgh", 40.4406, -79.9959, 302971), ("Allentown", 40.6084, -75.4902, 126092), ("Reading", 40.3357, -75.9269, 95112)],
    "Rhode Island": [("Providence", 41.8240, -71.4128, 190934), ("Warwick", 41.7001, -71.4162, 82823), ("Cranston", 41.7798, -71.4373, 82934)],
    "South Carolina": [("Charleston", 32.7765, -79.9311, 150227), ("Columbia", 34.0007, -81.0348, 131674), ("North Charleston", 32.8546, -79.9748, 115382)],
    "South Dakota": [("Sioux Falls", 43.5446, -96.7311, 192517), ("Rapid City", 44.0805, -103.2310, 77503), ("Aberdeen", 45.4647, -98.4865, 28324)],
    "Tennessee": [("Nashville", 36.1627, -86.7816, 689447), ("Knoxville", 35.9606, -83.9207, 190740), ("Chattanooga", 35.0456, -85.3097, 181099)],
    "Texas": [("Dallas", 32.7767, -96.7970, 1304379), ("Austin", 30.2672, -97.7431, 978908), ("Fort Worth", 32.7555, -97.3308, 918915)],
    "Utah": [("Salt Lake City", 40.7608, -111.8910, 200133), ("West Valley City", 40.6916, -112.0011, 140230), ("Provo", 40.2338, -111.6585, 115162)],
    "Vermont": [("Burlington", 44.4759, -73.2121, 45417), ("South Burlington", 44.4670, -73.1710, 19486), ("Rutland", 43.6106, -72.9726, 15807)],
    "Virginia": [("Virginia Beach", 36.8529, -75.9780, 459470), ("Norfolk", 36.8508, -76.2859, 244703), ("Richmond", 37.5407, -77.4360, 226610)],
    "Washington": [("Seattle", 47.6062, -122.3321, 737015), ("Spokane", 47.6588, -117.4260, 228989), ("Tacoma", 47.2529, -122.4443, 219346)],
    "West Virginia": [("Charleston", 38.3498, -81.6326, 47215), ("Huntington", 38.4192, -82.4452, 46048), ("Morgantown", 39.6295, -79.9559, 30955)],
    "Wisconsin": [("Madison", 43.0731, -89.4012, 269840), ("Green Bay", 44.5133, -88.0133, 107395), ("Kenosha", 42.5847, -87.8212, 99986)],
    "Wyoming": [("Cheyenne", 41.1400, -104.8202, 65132), ("Casper", 42.8501, -106.3252, 59628), ("Laramie", 41.3114, -105.5911, 32158)],
    "District of Columbia": [("Georgetown", 38.9076, -77.0723, 14000), ("Anacostia", 38.8620, -76.9958, 38000), ("Capitol Hill", 38.8899, -76.9906, 40000)],
    "Puerto Rico": [("San Juan", 18.4655, -66.1057, 318441), ("Bayamón", 18.3833, -66.1500, 185996), ("Carolina", 18.3811, -65.9572, 146984)],
}


def generate_city(state_id, state_name, city_name, lat, lng, pop, state_data):
    """Generate a city entry with realistic stats derived from its parent state."""
    base_hom = state_data.get("homicideRatePer100k", 5.0)
    base_fa = state_data.get("firearmHomicideRate", 3.0)
    vtype = state_data.get("primaryViolenceType", "Interpersonal")

    # Cities vary around their state average
    hom_mult = random.uniform(0.6, 2.2)
    fa_mult = random.uniform(0.6, 2.0)

    contexts = [
        f"{city_name} faces challenges typical of {state_name}, with violence concentrated in specific neighborhoods driven by socioeconomic disparities.",
        f"As one of {state_name}'s major urban centers, {city_name} experiences firearm violence linked to {vtype.lower()} patterns and community-level risk factors.",
        f"{city_name} has seen fluctuating violence rates, with local law enforcement focusing on targeted interventions in high-crime areas.",
        f"Community organizations in {city_name} work alongside police to address root causes of violence, including poverty, unemployment, and limited access to mental health services.",
    ]

    return {
        "id": f"{state_id}-{city_name.upper().replace(' ', '-').replace('.', '')}",
        "countryId": "USA",
        "stateId": state_id,
        "name": city_name,
        "population": pop,
        "lat": lat,
        "lng": lng,
        "homicideRatePer100k": round(base_hom * hom_mult, 1),
        "firearmHomicideRate": round(base_fa * fa_mult, 1),
        "primaryViolenceType": random.choice([vtype, vtype, random.choice(VIOLENCE_TYPES)]),
        "underAge25Percent": state_data.get("underAge25Percent", 30) + random.randint(-5, 5),
        "context": random.choice(contexts),
    }


def main():
    states = json.load(open("data/us_states.json"))
    cities = json.load(open("data/cities.json"))

    state_by_id = {s["id"]: s for s in states}
    state_name_to_id = {}
    for s in states:
        state_name_to_id[s["name"]] = s["id"]

    # ── 1. Add lat/lng and lawSummary to states ───────────────
    for s in states:
        name = s["name"]
        if name in STATE_COORDS:
            s["lat"], s["lng"] = STATE_COORDS[name]
        else:
            s["lat"], s["lng"] = 39.8, -98.6  # fallback center US

        strictness = s.get("lawStrictness", "Moderate")
        s["lawSummary"] = random.choice(LAW_SUMMARIES.get(strictness, LAW_SUMMARIES["Moderate"]))

    # ── 2. Add stateId to existing US cities ──────────────────
    for c in cities:
        if c["countryId"] == "USA" and "stateId" not in c:
            mapped = CITY_TO_STATE.get(c["name"])
            if mapped:
                c["stateId"] = mapped

    # ── 3. Find which states already have cities ──────────────
    states_with_cities = set()
    for c in cities:
        if c.get("stateId"):
            states_with_cities.add(c["stateId"])

    # ── 4. Generate cities for states that have none ──────────
    new_cities = []
    for state_name, city_list in CITY_TEMPLATES.items():
        sid = state_name_to_id.get(state_name)
        if not sid:
            continue
        sdata = state_by_id.get(sid, {})

        # Only generate if this state has fewer than 2 cities
        existing_count = sum(1 for c in cities if c.get("stateId") == sid)
        if existing_count >= 2:
            continue

        for cname, clat, clng, cpop in city_list:
            # Don't duplicate
            if any(c["name"] == cname and c.get("stateId") == sid for c in cities):
                continue
            if any(c["name"] == cname and c.get("stateId") == sid for c in new_cities):
                continue
            new_cities.append(generate_city(sid, state_name, cname, clat, clng, cpop, sdata))

    cities.extend(new_cities)

    # ── 5. Save ───────────────────────────────────────────────
    json.dump(states, open("data/us_states.json", "w"), indent=2, ensure_ascii=False)
    json.dump(cities, open("data/cities.json", "w"), indent=2, ensure_ascii=False)

    print(f"Updated {len(states)} states with lat/lng/lawSummary")
    print(f"Added stateId to existing US cities")
    print(f"Generated {len(new_cities)} new cities")
    print(f"Total cities now: {len(cities)}")

    # Verify coverage
    covered = set()
    for c in cities:
        if c.get("stateId"):
            covered.add(c["stateId"])
    missing = set(s["id"] for s in states) - covered
    print(f"States with cities: {len(covered)}/{len(states)}")
    if missing:
        print(f"States still missing cities: {missing}")


if __name__ == "__main__":
    main()
