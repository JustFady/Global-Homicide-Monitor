#!/usr/bin/env python3
"""Fix generic city names - replace Metro/generated names with real city names."""
import json

# Real secondary/tertiary cities for each country
REAL_CITIES = {
    "AFG19": ["Herat", "Kandahar", "Mazar-i-Sharif", "Jalalabad"],
    "ALB36": ["Tirana", "Durrës", "Vlorë", "Shkodër"],
    "ALG46": ["Algiers", "Oran", "Constantine", "Annaba"],
    "ANG88": ["Luanda", "Huambo", "Lobito", "Benguela"],
    "ARG96": ["Córdoba", "Rosario", "Mendoza", "Tucumán"],
    "ARM72": ["Yerevan", "Gyumri", "Vanadzor"],
    "AUS70": ["Vienna", "Graz", "Linz", "Salzburg"],
    "AUS85": ["Brisbane", "Perth", "Adelaide", "Canberra"],
    "AZE89": ["Baku", "Ganja", "Sumqayit"],
    "BAH76": ["Nassau", "Freeport", "West End"],
    "BAN21": ["Dhaka", "Chittagong", "Khulna", "Rajshahi"],
    "BEL22": ["Minsk", "Gomel", "Mogilev", "Vitebsk"],
    "BEL40": ["Brussels", "Antwerp", "Ghent", "Charleroi"],
    "BEL93": ["Belize City", "Belmopan", "San Ignacio"],
    "BEN89": ["Cotonou", "Porto-Novo", "Parakou"],
    "BHU94": ["Thimphu", "Phuntsholing", "Paro"],
    "BOL20": ["La Paz", "Santa Cruz", "Cochabamba", "Sucre"],
    "BOS55": ["Sarajevo", "Banja Luka", "Tuzla"],
    "BOT79": ["Gaborone", "Francistown", "Maun"],
    "BRA65": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"],
    "BRU93": ["Bandar Seri Begawan", "Seria", "Tutong"],
    "BUL93": ["Sofia", "Plovdiv", "Varna", "Burgas"],
    "BUR83": ["Bujumbura", "Gitega", "Muyinga"],
    "BUR94": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou"],
    "CAM43": ["Phnom Penh", "Siem Reap", "Battambang"],
    "CAM49": ["Yaoundé", "Douala", "Garoua", "Bamenda"],
    "CAN91": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    "CEN22": ["Bangui", "Bimbo", "Berbérati"],
    "CHA86": ["N'Djamena", "Moundou", "Abéché"],
    "CHI10": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"],
    "CHI75": ["Santiago", "Valparaíso", "Concepción", "Antofagasta"],
    "COL49": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"],
    "CON40": ["Brazzaville", "Pointe-Noire", "Dolisie"],
    "COS98": ["San José", "Limón", "Heredia", "Alajuela"],
    "CRO32": ["Zagreb", "Split", "Rijeka", "Osijek"],
    "CUB68": ["Havana", "Santiago de Cuba", "Camagüey", "Holguín"],
    "CYP99": ["Nicosia", "Limassol", "Larnaca"],
    "CZE33": ["Prague", "Brno", "Ostrava", "Plzeň"],
    "CÔT37": ["Abidjan", "Yamoussoukro", "Bouaké"],
    "DEM73": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi"],
    "DEN80": ["Copenhagen", "Aarhus", "Odense"],
    "DJI19": ["Djibouti City", "Ali Sabieh", "Tadjoura"],
    "DOM65": ["Santo Domingo", "Santiago", "San Pedro de Macorís"],
    "ECU24": ["Quito", "Guayaquil", "Cuenca", "Machala"],
    "EGY58": ["Cairo", "Alexandria", "Giza", "Luxor"],
    "EL 52": ["San Salvador", "Santa Ana", "San Miguel"],
    "EQ.92": ["Malabo", "Bata", "Ebebiyín"],
    "ERI75": ["Asmara", "Keren", "Massawa"],
    "EST62": ["Tallinn", "Tartu", "Narva"],
    "ESW30": ["Mbabane", "Manzini", "Lobamba"],
    "ETH97": ["Addis Ababa", "Dire Dawa", "Mekelle", "Bahir Dar"],
    "FAL32": ["Stanley", "Goose Green"],
    "FIJ48": ["Suva", "Nadi", "Lautoka"],
    "FIN94": ["Helsinki", "Espoo", "Tampere", "Turku"],
    "FR.68": ["Port-aux-Français"],
    "FRA84": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
    "GAB40": ["Libreville", "Port-Gentil", "Franceville"],
    "GAM80": ["Banjul", "Serekunda", "Brikama"],
    "GEO86": ["Tbilisi", "Batumi", "Kutaisi"],
    "GER42": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
    "GHA76": ["Accra", "Kumasi", "Tamale", "Sekondi-Takoradi"],
    "GRE31": ["Athens", "Thessaloniki", "Patras", "Heraklion"],
    "GRE40": ["Nuuk", "Ilulissat", "Sisimiut"],
    "GUA57": ["Guatemala City", "Mixco", "Quetzaltenango"],
    "GUI45": ["Conakry", "Nzérékoré", "Kankan"],
    "GUI53": ["Bissau", "Bafatá", "Gabú"],
    "GUY99": ["Georgetown", "Linden", "New Amsterdam"],
    "HAI42": ["Port-au-Prince", "Cap-Haïtien", "Gonaïves"],
    "HON36": ["Tegucigalpa", "San Pedro Sula", "La Ceiba", "Choloma"],
    "HUN72": ["Budapest", "Debrecen", "Szeged", "Pécs"],
    "ICE51": ["Reykjavik", "Akureyri", "Kópavogur"],
    "IND66": ["Jakarta", "Surabaya", "Bandung", "Medan"],
    "IND98": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"],
    "IRA53": ["Tehran", "Isfahan", "Mashhad", "Tabriz"],
    "IRA65": ["Baghdad", "Basra", "Mosul", "Erbil"],
    "IRE56": ["Dublin", "Cork", "Galway", "Limerick"],
    "ISR11": ["Tel Aviv", "Jerusalem", "Haifa", "Be'er Sheva"],
    "ITA17": ["Rome", "Milan", "Naples", "Turin", "Palermo"],
    "JAM82": ["Kingston", "Montego Bay", "Spanish Town"],
    "JAP63": ["Tokyo", "Osaka", "Yokohama", "Nagoya", "Sapporo"],
    "JOR65": ["Amman", "Zarqa", "Irbid"],
    "KAZ50": ["Almaty", "Astana", "Shymkent", "Karaganda"],
    "KEN79": ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
    "KOS29": ["Pristina", "Prizren", "Mitrovica"],
    "KUW16": ["Kuwait City", "Hawalli", "Salmiya"],
    "KYR89": ["Bishkek", "Osh", "Jalal-Abad"],
    "LAO22": ["Vientiane", "Luang Prabang", "Savannakhet"],
    "LAT31": ["Riga", "Daugavpils", "Liepāja"],
    "LEB91": ["Beirut", "Tripoli", "Sidon", "Jounieh"],
    "LES43": ["Maseru", "Teyateyaneng", "Mafeteng"],
    "LIB73": ["Tripoli", "Benghazi", "Misrata"],
    "LIB77": ["Monrovia", "Gbarnga", "Buchanan"],
    "LIT15": ["Vilnius", "Kaunas", "Klaipėda"],
    "LUX31": ["Luxembourg City", "Esch-sur-Alzette", "Differdange"],
    "MAC96": ["Skopje", "Bitola", "Kumanovo"],
    "MAD97": ["Antananarivo", "Toamasina", "Antsirabe"],
    "MAL73": ["Kuala Lumpur", "George Town", "Johor Bahru"],
    "MAL75": ["Lilongwe", "Blantyre", "Mzuzu"],
    "MAL76": ["Bamako", "Sikasso", "Mopti"],
    "MAU48": ["Nouakchott", "Nouadhibou", "Kaédi"],
    "MEX72": ["Mexico City", "Guadalajara", "Monterrey", "Tijuana", "Ciudad Juárez"],
    "MOL84": ["Chișinău", "Tiraspol", "Bălți"],
    "MON30": ["Podgorica", "Nikšić", "Cetinje"],
    "MON59": ["Ulaanbaatar", "Erdenet", "Darkhan"],
    "MOR63": ["Casablanca", "Rabat", "Fes", "Marrakech"],
    "MOZ59": ["Maputo", "Beira", "Nampula", "Quelimane"],
    "MYA52": ["Yangon", "Mandalay", "Naypyidaw"],
    "N. 10": ["North Nicosia", "Famagusta", "Kyrenia"],
    "NAM25": ["Windhoek", "Walvis Bay", "Swakopmund"],
    "NEP76": ["Kathmandu", "Pokhara", "Lalitpur"],
    "NET74": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"],
    "NEW71": ["Nouméa", "Dumbéa", "Mont-Dore"],
    "NEW88": ["Auckland", "Wellington", "Christchurch"],
    "NIC11": ["Managua", "León", "Masaya"],
    "NIG41": ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt"],
    "NIG47": ["Niamey", "Zinder", "Maradi"],
    "NOR18": ["Oslo", "Bergen", "Trondheim", "Stavanger"],
    "NOR90": ["Pyongyang", "Hamhung", "Chongjin"],
    "OMA15": ["Muscat", "Salalah", "Sohar"],
    "PAK52": ["Karachi", "Lahore", "Islamabad", "Faisalabad"],
    "PAL94": ["Gaza City", "Ramallah", "Hebron"],
    "PAN16": ["Panama City", "Colón", "David"],
    "PAP37": ["Port Moresby", "Lae", "Mount Hagen"],
    "PAR27": ["Asunción", "Ciudad del Este", "Encarnación"],
    "PER53": ["Lima", "Arequipa", "Cusco", "Trujillo"],
    "PHI27": ["Manila", "Cebu City", "Davao", "Quezon City"],
    "POL77": ["Warsaw", "Kraków", "Gdańsk", "Wrocław"],
    "POR15": ["Lisbon", "Porto", "Faro", "Coimbra"],
    "PUE84": ["San Juan", "Bayamón", "Ponce"],
    "QAT31": ["Doha", "Al Wakrah", "Al Khor"],
    "ROM30": ["Bucharest", "Cluj-Napoca", "Timișoara"],
    "RUS23": ["Moscow", "St. Petersburg", "Novosibirsk", "Yekaterinburg"],
    "RWA77": ["Kigali", "Butare", "Gisenyi"],
    "S. 45": ["Juba", "Malakal", "Wau"],
    "SAU36": ["Riyadh", "Jeddah", "Mecca", "Dammam"],
    "SEN66": ["Dakar", "Touba", "Saint-Louis"],
    "SER51": ["Belgrade", "Novi Sad", "Niš"],
    "SIE89": ["Freetown", "Bo", "Kenema"],
    "SLO38": ["Bratislava", "Košice", "Prešov"],
    "SLO87": ["Ljubljana", "Maribor", "Celje"],
    "SOL71": ["Honiara", "Auki", "Gizo"],
    "SOM40": ["Hargeisa", "Berbera", "Burao"],
    "SOM64": ["Mogadishu", "Kismayo", "Baidoa"],
    "SOU26": ["Seoul", "Busan", "Incheon", "Daegu"],
    "SOU37": ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
    "SPA61": ["Madrid", "Barcelona", "Seville", "Valencia"],
    "SRI43": ["Colombo", "Kandy", "Galle"],
    "SUD83": ["Khartoum", "Omdurman", "Port Sudan"],
    "SUR80": ["Paramaribo", "Lelydorp", "Nieuw Nickerie"],
    "SWE67": ["Stockholm", "Gothenburg", "Malmö", "Uppsala"],
    "SWI32": ["Zurich", "Geneva", "Basel", "Bern"],
    "SYR17": ["Damascus", "Aleppo", "Homs", "Latakia"],
    "TAI26": ["Taipei", "Kaohsiung", "Taichung"],
    "TAJ34": ["Dushanbe", "Khujand", "Kulob"],
    "TAN62": ["Dar es Salaam", "Dodoma", "Mwanza"],
    "THA80": ["Bangkok", "Chiang Mai", "Phuket", "Pattaya"],
    "TIM33": ["Dili", "Baucau", "Suai"],
    "TOG66": ["Lomé", "Sokodé", "Kara"],
    "TRI81": ["Port of Spain", "San Fernando", "Chaguanas"],
    "TUN21": ["Tunis", "Sfax", "Sousse"],
    "TUR16": ["Istanbul", "Ankara", "Izmir", "Antalya"],
    "TUR92": ["Ashgabat", "Türkmenabat", "Daşoguz"],
    "UGA49": ["Kampala", "Gulu", "Entebbe"],
    "UKR56": ["Kyiv", "Kharkiv", "Odessa", "Lviv"],
    "UNI16": ["London", "Manchester", "Birmingham", "Glasgow"],
    "UNI86": ["Dubai", "Abu Dhabi", "Sharjah"],
    "URU20": ["Montevideo", "Salto", "Paysandú"],
    "UZB53": ["Tashkent", "Samarkand", "Bukhara"],
    "VAN65": ["Port Vila", "Luganville"],
    "VEN40": ["Caracas", "Maracaibo", "Valencia", "Barquisimeto"],
    "VIE99": ["Hanoi", "Ho Chi Minh City", "Da Nang"],
    "W. 67": ["Laayoune", "Dakhla"],
    "YEM18": ["Sanaa", "Aden", "Taiz"],
    "ZAM92": ["Lusaka", "Kitwe", "Ndola"],
    "ZIM94": ["Harare", "Bulawayo", "Mutare"],
}

with open('data/cities.json') as f:
    cities = json.load(f)

# Build lookup of existing real names per country
existing_real = {}
for cid, names in REAL_CITIES.items():
    existing_real[cid] = [n.lower() for n in names]

fixed = 0
for city in cities:
    cid = city['countryId']
    name = city['name']
    
    # Check if this is a generic name
    is_generic = ('Metro' in name or 
                  any(name.endswith(s) for s in ['town', 'ville', 'burg', 'port', 'field', 'haven', 'dale', 'wood']) and 
                  len(name.split()) == 1)
    
    if not is_generic:
        continue
    
    if cid not in REAL_CITIES:
        continue
    
    # Find a real name not already used
    used = set(c['name'].lower() for c in cities if c['countryId'] == cid and c['name'] != name)
    for real_name in REAL_CITIES[cid]:
        if real_name.lower() not in used:
            city['name'] = real_name
            # Update ID too
            city['id'] = f"{cid[:3]}{real_name[:3].upper()}{hash(real_name) % 100:02d}"
            used.add(real_name.lower())
            fixed += 1
            break

# Sort
cities.sort(key=lambda c: (c.get('countryId', ''), c.get('name', '')))

with open('data/cities.json', 'w') as f:
    json.dump(cities, f, indent=2, ensure_ascii=False)

print(f"Fixed {fixed} generic city names")
print(f"Total cities: {len(cities)}")

# Verify
generic_remaining = sum(1 for c in cities if 'Metro' in c['name'])
print(f"Remaining 'Metro' names: {generic_remaining}")
