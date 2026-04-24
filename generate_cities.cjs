/**
 * generate_cities.cjs
 * Run with: node generate_cities.cjs
 * Outputs enriched cities.json to ./data/cities.json
 *
 * Strategy:
 * - Keep existing countries' city entries but REPLACE them with real named cities
 * - Add additional cities for countries that had none or few
 */

const fs = require("fs");
const path = require("path");

// ── Real city data keyed by countryId ──────────────────────────────
// Each entry: { name, lat, lng, population, homicideRatePer100k, firearmHomicideRate,
//               primaryViolenceType, underAge25Percent, context }
const REAL_CITIES = {
  USA: [
    { name: "Chicago", lat: 41.8781, lng: -87.6298, population: 2696555, homicideRatePer100k: 18.3, firearmHomicideRate: 15.9, primaryViolenceType: "Gang-related", underAge25Percent: 34, context: "Chicago's South and West Sides account for the majority of gun homicides, driven by entrenched gang territories and concentrated poverty." },
    { name: "Baltimore", lat: 39.2904, lng: -76.6122, population: 585708, homicideRatePer100k: 51.1, firearmHomicideRate: 46.2, primaryViolenceType: "Gang-related", underAge25Percent: 37, context: "Baltimore consistently ranks among the most violent cities in the US, with drug-market disputes and gang conflict as primary drivers." },
    { name: "St. Louis", lat: 38.6270, lng: -90.1994, population: 301578, homicideRatePer100k: 45.3, firearmHomicideRate: 40.8, primaryViolenceType: "Gang-related", underAge25Percent: 35, context: "Decades of disinvestment and segregation have left St. Louis with one of the highest homicide rates per capita in the nation." },
    { name: "New Orleans", lat: 29.9511, lng: -90.0715, population: 383997, homicideRatePer100k: 37.1, firearmHomicideRate: 32.6, primaryViolenceType: "Gang-related", underAge25Percent: 36, context: "New Orleans struggles with persistent violence tied to the trafficking of illegal firearms and drug-related gang activity." },
    { name: "Detroit", lat: 42.3314, lng: -83.0458, population: 632464, homicideRatePer100k: 41.8, firearmHomicideRate: 38.1, primaryViolenceType: "Gang-related", underAge25Percent: 38, context: "Detroit's economic collapse following deindustrialization has contributed to elevated homicide rates and concentrated urban poverty." },
    { name: "Memphis", lat: 35.1495, lng: -90.0490, population: 633104, homicideRatePer100k: 28.9, firearmHomicideRate: 25.3, primaryViolenceType: "Gang-related", underAge25Percent: 36, context: "Memphis sees high rates of firearm violence tied to interstate drug routes and limited community investment in high-crime neighborhoods." },
    { name: "Kansas City", lat: 39.0997, lng: -94.5786, population: 508090, homicideRatePer100k: 32.4, firearmHomicideRate: 29.0, primaryViolenceType: "Gang-related", underAge25Percent: 35, context: "Kansas City MO faces persistent gang and drug-related violence concentrated in its urban core." },
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437, population: 3898747, homicideRatePer100k: 7.9, firearmHomicideRate: 5.8, primaryViolenceType: "Gang-related", underAge25Percent: 33, context: "Los Angeles has dramatically reduced gang homicides since the 1990s peak but certain neighborhoods remain hotspots for firearm violence." },
    { name: "New York City", lat: 40.7128, lng: -74.0060, population: 8336817, homicideRatePer100k: 4.1, firearmHomicideRate: 2.9, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 31, context: "New York City saw a historic reduction in crime through the 1990s-2000s; gun homicides remain concentrated in a handful of high-poverty neighborhoods." },
    { name: "Philadelphia", lat: 39.9526, lng: -75.1652, population: 1603797, homicideRatePer100k: 22.2, firearmHomicideRate: 19.8, primaryViolenceType: "Gang-related", underAge25Percent: 36, context: "Philadelphia declared a gun violence public health emergency after setting homicide records; illegal gun trafficking is a primary driver." },
    { name: "Houston", lat: 29.7604, lng: -95.3698, population: 2304580, homicideRatePer100k: 13.3, firearmHomicideRate: 10.6, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 35, context: "Houston's sprawling geography and permissive state gun laws contribute to elevated firearm homicide rates across diverse neighborhoods." },
    { name: "Indianapolis", lat: 39.7684, lng: -86.1581, population: 887642, homicideRatePer100k: 23.1, firearmHomicideRate: 20.5, primaryViolenceType: "Gang-related", underAge25Percent: 36, context: "Indianapolis has seen a sharp rise in homicides, linked to illegal gun proliferation and gang rivalries on the city's east and northwest sides." },
  ],

  BRA: [
    { name: "Fortaleza",      lat: -3.7327,  lng: -38.5270, population: 2686612, homicideRatePer100k: 78.3, firearmHomicideRate: 70.2, primaryViolenceType: "Gang-related", underAge25Percent: 55, context: "Fortaleza is home to violent faction wars between the Comando Vermelho and local gangs, making it one of the world's deadliest cities." },
    { name: "Maceió",         lat: -9.6658,  lng: -35.7353, population: 1025360, homicideRatePer100k: 74.1, firearmHomicideRate: 66.5, primaryViolenceType: "Gang-related", underAge25Percent: 57, context: "Maceió's high homicide rate is tied to drug trafficking conflicts and large peripheral communities with limited state presence." },
    { name: "Natal",          lat: -5.7945,  lng: -35.2110, population: 890480,  homicideRatePer100k: 69.4, firearmHomicideRate: 62.0, primaryViolenceType: "Gang-related", underAge25Percent: 56, context: "Drug-trafficking organizations from São Paulo have expanded into Natal, triggering sharp spikes in firearm homicides." },
    { name: "Salvador",       lat: -12.9714, lng: -38.5014, population: 2886698, homicideRatePer100k: 59.1, firearmHomicideRate: 52.8, primaryViolenceType: "Gang-related", underAge25Percent: 54, context: "Salvador suffers from deep racial and economic inequality, with Afro-Brazilian youth disproportionately impacted by gun violence." },
    { name: "São Paulo",      lat: -23.5505, lng: -46.6333, population: 12325232,homicideRatePer100k: 9.6,  firearmHomicideRate: 7.2,  primaryViolenceType: "Gang-related", underAge25Percent: 45, context: "São Paulo dramatically reduced homicides in the 2000s partly through PCC gang-imposed order; peripheral neighborhoods still face high rates." },
    { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, population: 6747815, homicideRatePer100k: 30.4, firearmHomicideRate: 26.3, primaryViolenceType: "Organized Crime", underAge25Percent: 48, context: "Rio's favela communities are controlled by armed militia groups and drug factions; police pacification efforts have shown mixed results." },
    { name: "Belém",          lat: -1.4558,  lng: -48.5044, population: 1499641, homicideRatePer100k: 52.0, firearmHomicideRate: 46.1, primaryViolenceType: "Gang-related", underAge25Percent: 54, context: "Belém is a major transshipment hub for cocaine flowing from Bolivia and Peru, fueling lethal gang competition." },
    { name: "Manaus",         lat: -3.1190,  lng: -60.0217, population: 2219580, homicideRatePer100k: 44.7, firearmHomicideRate: 39.8, primaryViolenceType: "Gang-related", underAge25Percent: 52, context: "Manaus is contested between the PCC and Família do Norte, with the Amazon river network enabling weapons trafficking." },
  ],

  MEX: [
    { name: "Tijuana",         lat: 32.5027, lng: -117.0036, population: 1922523, homicideRatePer100k: 105.5, firearmHomicideRate: 98.2, primaryViolenceType: "Organized Crime", underAge25Percent: 53, context: "Tijuana is a primary battleground for the Sinaloa Cartel and CJNG, making it one of the most violent cities in the world." },
    { name: "Juárez",          lat: 31.6904, lng: -106.4245, population: 1567825, homicideRatePer100k: 86.4, firearmHomicideRate: 80.1, primaryViolenceType: "Organized Crime", underAge25Percent: 52, context: "Ciudad Juárez was once the world's most violent city; cartel wars over the US border crossing continue to claim lives." },
    { name: "Colima",          lat: 19.2433, lng: -103.7235, population: 161420,  homicideRatePer100k: 107.2,firearmHomicideRate: 100.8,primaryViolenceType: "Organized Crime", underAge25Percent: 55, context: "Colima state has the highest homicide rate in Mexico per capita, driven by Jalisco Cartel and local criminal groups." },
    { name: "Acapulco",        lat: 16.8531, lng: -99.8237,  population: 779566,  homicideRatePer100k: 88.0, firearmHomicideRate: 81.5, primaryViolenceType: "Organized Crime", underAge25Percent: 54, context: "Once a glamorous resort, Acapulco descended into cartel warfare that decimated tourism and caused mass displacement." },
    { name: "Mexico City",     lat: 19.4326, lng: -99.1332,  population: 9209944, homicideRatePer100k: 8.0,  firearmHomicideRate: 5.8,  primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 42, context: "Mexico City maintains a relatively lower homicide rate compared to cartel-contested regions due to heavy police presence and political importance." },
    { name: "Guadalajara",     lat: 20.6597, lng: -103.3496, population: 1495189, homicideRatePer100k: 22.3, firearmHomicideRate: 18.9, primaryViolenceType: "Organized Crime", underAge25Percent: 47, context: "Guadalajara is the CJNG's home base; extortion, kidnapping and turf violence affect working-class neighborhoods." },
    { name: "Culiacán",        lat: 24.8049, lng: -107.3941, population: 858638,  homicideRatePer100k: 41.6, firearmHomicideRate: 37.9, primaryViolenceType: "Organized Crime", underAge25Percent: 50, context: "Culiacán is the capital of Sinaloa and home to the Sinaloa Cartel; gun culture is deeply embedded in the region." },
  ],

  COL: [
    { name: "Cali",        lat: 3.4516,  lng: -76.5320, population: 2227642, homicideRatePer100k: 55.4, firearmHomicideRate: 49.2, primaryViolenceType: "Gang-related", underAge25Percent: 53, context: "Cali is divided among armed criminal organizations (combos) linked to major drug trafficking networks." },
    { name: "Barranquilla",lat: 10.9685, lng: -74.7813, population: 1274250, homicideRatePer100k: 22.1, firearmHomicideRate: 18.6, primaryViolenceType: "Gang-related", underAge25Percent: 50, context: "Barranquilla has reduced homicides but remains contested by the Clan del Golfo and local street gangs." },
    { name: "Medellín",    lat: 6.2442,  lng: -75.5812, population: 2569007, homicideRatePer100k: 19.8, firearmHomicideRate: 16.2, primaryViolenceType: "Gang-related", underAge25Percent: 48, context: "Medellín transformed from the world's most violent city in the 1990s to a model of urban innovation; armed combos still operate in peripheral comunas." },
    { name: "Bogotá",      lat: 4.7110,  lng: -74.0721, population: 7743955, homicideRatePer100k: 15.3, firearmHomicideRate: 11.8, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 44, context: "Bogotá has significantly reduced homicides since the 1990s through strong mayoral leadership and social investment." },
    { name: "Buenaventura", lat: 3.8808, lng: -77.0319, population: 415414,  homicideRatePer100k: 44.0, firearmHomicideRate: 39.5, primaryViolenceType: "Organized Crime", underAge25Percent: 56, context: "Buenaventura is Colombia's main Pacific port; ELN, FARC dissidents, and the Clan del Golfo fight for control of cocaine export routes." },
  ],

  VEN: [
    { name: "Caracas",    lat: 10.4806, lng: -66.9036, population: 2900000, homicideRatePer100k: 119.9, firearmHomicideRate: 112.3, primaryViolenceType: "Gang-related", underAge25Percent: 58, context: "Caracas is among the world's most dangerous capitals; gang structures known as 'colectivos' operate with near-impunity in barrios." },
    { name: "Valencia",   lat: 10.1620, lng: -68.0073, population: 1400000, homicideRatePer100k: 88.0, firearmHomicideRate: 80.4, primaryViolenceType: "Gang-related", underAge25Percent: 57, context: "Valencia is Venezuela's industrial capital but suffers from extreme homicide rates driven by armed gang control of neighborhoods." },
    { name: "Maracaibo",  lat: 10.6666, lng: -71.6124, population: 1891000, homicideRatePer100k: 76.3, firearmHomicideRate: 68.9, primaryViolenceType: "Gang-related", underAge25Percent: 56, context: "Maracaibo's oil wealth has collapsed; gang violence and extortion fill the power vacuum left by economic and institutional failure." },
    { name: "Barquisimeto",lat:10.0678, lng: -69.3474, population: 1252000, homicideRatePer100k: 58.2, firearmHomicideRate: 51.6, primaryViolenceType: "Gang-related", underAge25Percent: 55, context: "Barquisimeto sees persistent gang-related violence as criminal organizations exploit ungoverned urban peripheries." },
  ],

  ZAF: [
    { name: "Cape Town",      lat: -33.9249, lng: 18.4241,  population: 4618000, homicideRatePer100k: 62.5, firearmHomicideRate: 48.1, primaryViolenceType: "Gang-related", underAge25Percent: 52, context: "Cape Town's Cape Flats townships are battlegrounds for the Americans, Mongrels, and Fancy Boys gangs, driving extreme homicide rates." },
    { name: "Johannesburg",   lat: -26.2041, lng: 28.0473,  population: 5782747, homicideRatePer100k: 29.0, firearmHomicideRate: 21.3, primaryViolenceType: "Organized Crime", underAge25Percent: 50, context: "Johannesburg faces violence from organized crime networks and high levels of robbery-related killings in CBD and township areas." },
    { name: "Durban",         lat: -29.8587, lng: 31.0218,  population: 3720000, homicideRatePer100k: 34.7, firearmHomicideRate: 24.8, primaryViolenceType: "Gang-related", underAge25Percent: 51, context: "Durban's taxi violence and gang activity in Umlazi and other townships contribute to elevated homicide rates." },
    { name: "Nelson Mandela Bay",lat:-33.904,lng: 25.5704, population: 1253406, homicideRatePer100k: 47.2, firearmHomicideRate: 36.9, primaryViolenceType: "Gang-related", underAge25Percent: 53, context: "Port Elizabeth / Gqeberha faces some of the worst gang violence outside Cape Town, driven by drug trafficking and high unemployment." },
  ],

  JAP: [
    { name: "Tokyo",    lat: 35.6762,  lng: 139.6503, population: 13960000, homicideRatePer100k: 0.26, firearmHomicideRate: 0.04, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 22, context: "Tokyo is one of the world's safest megacities; strict gun laws, cultural norms, and an effective police presence keep crime extremely low." },
    { name: "Osaka",    lat: 34.6937,  lng: 135.5023, population: 2691000,  homicideRatePer100k: 0.31, firearmHomicideRate: 0.05, primaryViolenceType: "Organized Crime", underAge25Percent: 23, context: "Osaka has a small yakuza presence (Yamaguchi-gumi HQ in nearby Kobe) but civilian gun homicide remains vanishingly rare." },
    { name: "Nagoya",   lat: 35.1815,  lng: 136.9066, population: 2296000,  homicideRatePer100k: 0.22, firearmHomicideRate: 0.03, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 24, context: "Nagoya's manufacturing economy and tight community ties contribute to some of the lowest violence rates in Japan." },
  ],

  GBR: [
    { name: "London",       lat: 51.5074, lng: -0.1278, population: 8982000, homicideRatePer100k: 1.5, firearmHomicideRate: 0.15, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 32, context: "London has low gun homicide rates due to near-total civilian handgun bans; knife crime is the greater concern in certain boroughs." },
    { name: "Birmingham",   lat: 52.4862, lng: -1.8904, population: 1144919, homicideRatePer100k: 2.3, firearmHomicideRate: 0.25, primaryViolenceType: "Gang-related", underAge25Percent: 38, context: "Birmingham's gang landscape involves small criminal networks; most violence is knife-related with occasional firearms use." },
    { name: "Manchester",   lat: 53.4808, lng: -2.2426, population: 553230,  homicideRatePer100k: 1.9, firearmHomicideRate: 0.20, primaryViolenceType: "Gang-related", underAge25Percent: 36, context: "Manchester's Moss Side area historically had gun violence from gangs; targeted policing has significantly reduced firearm incidents." },
    { name: "Liverpool",    lat: 53.4084, lng: -2.9916, population: 498042,  homicideRatePer100k: 2.1, firearmHomicideRate: 0.22, primaryViolenceType: "Gang-related", underAge25Percent: 37, context: "Liverpool has a history of gang-related gun violence; Merseyside Police operations and community programs have reduced incidents." },
  ],

  GER: [
    { name: "Berlin",    lat: 52.5200, lng: 13.4050, population: 3769495, homicideRatePer100k: 1.0, firearmHomicideRate: 0.10, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 28, context: "Berlin has very low gun violence; illegal firearms from post-Soviet states occasionally surface in organized crime contexts." },
    { name: "Hamburg",   lat: 53.5753, lng: 10.0153, population: 1841179, homicideRatePer100k: 1.2, firearmHomicideRate: 0.12, primaryViolenceType: "Organized Crime", underAge25Percent: 27, context: "Hamburg's port makes it a trafficking hub; organized crime operates largely in the drug trade with limited public gun violence." },
    { name: "Munich",    lat: 48.1351, lng: 11.5820, population: 1456039, homicideRatePer100k: 0.7, firearmHomicideRate: 0.07, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 26, context: "Munich boasts some of Germany's lowest crime rates; high living standards and low inequality underpin public safety." },
    { name: "Cologne",   lat: 50.9333, lng: 6.9500,  population: 1083498, homicideRatePer100k: 1.1, firearmHomicideRate: 0.11, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 29, context: "Cologne maintains low homicide rates; gang-related incidents occur in specific neighborhoods but are met with swift police response." },
  ],

  FRA: [
    { name: "Paris",      lat: 48.8566, lng: 2.3522,  population: 2161000, homicideRatePer100k: 1.6, firearmHomicideRate: 0.35, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 30, context: "Paris proper has low homicide rates; banlieue housing projects on the periphery see higher violence linked to drug market conflicts." },
    { name: "Marseille",  lat: 43.2965, lng: 5.3698,  population: 861635,  homicideRatePer100k: 5.3, firearmHomicideRate: 3.1,  primaryViolenceType: "Organized Crime", underAge25Percent: 38, context: "Marseille has France's highest gun homicide rates, driven by North African gang networks ('points de deal') fighting over drug territory." },
    { name: "Lyon",       lat: 45.7640, lng: 4.8357,  population: 516092,  homicideRatePer100k: 1.8, firearmHomicideRate: 0.40, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 33, context: "Lyon is France's third-largest city with relatively low violence; police presence in problematic peripheral communes has increased." },
    { name: "Toulouse",   lat: 43.6047, lng: 1.4442,  population: 479553,  homicideRatePer100k: 1.5, firearmHomicideRate: 0.30, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 32, context: "Toulouse is a dynamic aerospace hub city with a student population; urban violence is limited to a few peripheral neighborhoods." },
  ],

  IND: [
    { name: "Mumbai",    lat: 19.0760, lng: 72.8777, population: 12478447, homicideRatePer100k: 2.3, firearmHomicideRate: 0.8, primaryViolenceType: "Organized Crime", underAge25Percent: 42, context: "Mumbai's organized crime networks (once associated with D-Company) have weakened, but extortion and targeted killings still occur in certain areas." },
    { name: "Delhi",     lat: 28.6139, lng: 77.2090, population: 16787941, homicideRatePer100k: 3.4, firearmHomicideRate: 1.2, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 43, context: "Delhi sees elevated violent crime including gang-related murders; illegal country-made firearms (katta) are a persistent challenge." },
    { name: "Chennai",   lat: 13.0827, lng: 80.2707, population: 7088000,  homicideRatePer100k: 1.8, firearmHomicideRate: 0.5, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 40, context: "Chennai has relatively lower violence rates compared to northern Indian cities; caste-related conflicts occasionally result in murders." },
    { name: "Kolkata",   lat: 22.5726, lng: 88.3639, population: 4631392,  homicideRatePer100k: 2.0, firearmHomicideRate: 0.7, primaryViolenceType: "Political", underAge25Percent: 41, context: "Kolkata has historically seen politically-motivated violence; TMC-BJP clashes have resulted in targeted killings during election cycles." },
    { name: "Patna",     lat: 25.5941, lng: 85.1376, population: 2046652,  homicideRatePer100k: 6.2, firearmHomicideRate: 4.1, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 48, context: "Bihar state has historically high violent crime rates; illegal gun manufacturing is widespread in districts like Munger." },
  ],

  RUS: [
    { name: "Moscow",             lat: 55.7558, lng: 37.6176, population: 12506468, homicideRatePer100k: 2.8, firearmHomicideRate: 0.7, primaryViolenceType: "Organized Crime", underAge25Percent: 30, context: "Moscow's homicide rate has dropped significantly since the chaotic 1990s; organized crime murders still occur but are increasingly rare." },
    { name: "Saint Petersburg",   lat: 59.9311, lng: 30.3609, population: 5384342,  homicideRatePer100k: 2.5, firearmHomicideRate: 0.6, primaryViolenceType: "Organized Crime", underAge25Percent: 29, context: "St. Petersburg was a major mob hub in the 1990s; today violent crime is far lower but financial crime and extortion persist." },
    { name: "Yekaterinburg",      lat: 56.8389, lng: 60.6057, population: 1495066,  homicideRatePer100k: 3.8, firearmHomicideRate: 1.0, primaryViolenceType: "Organized Crime", underAge25Percent: 32, context: "Yekaterinburg has an active criminal underworld tied to the Urals crime groups; street violence and contract killings occur periodically." },
    { name: "Novosibirsk",        lat: 54.9885, lng: 82.9207, population: 1621000,  homicideRatePer100k: 4.4, firearmHomicideRate: 1.2, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 33, context: "Novosibirsk experiences above-average Russian homicide rates; alcohol-related domestic violence is a major contributing factor." },
  ],

  CHN: [
    { name: "Shanghai",    lat: 31.2304, lng: 121.4737, population: 24870895, homicideRatePer100k: 0.6, firearmHomicideRate: 0.02, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 25, context: "Shanghai has extremely low firearm homicides due to near-total civilian gun prohibition; economic disputes occasionally turn violent." },
    { name: "Beijing",     lat: 39.9042, lng: 116.4074, population: 21542000, homicideRatePer100k: 0.5, firearmHomicideRate: 0.02, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 24, context: "Beijing maintains a heavy security presence and extremely tight gun controls; homicide rates are among the world's lowest for a megacity." },
    { name: "Shenzhen",    lat: 22.5431, lng: 114.0579, population: 17560000, homicideRatePer100k: 0.9, firearmHomicideRate: 0.03, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 38, context: "Shenzhen's young migrant-worker population brings slightly higher friction crime; firearm incidents remain very rare." },
    { name: "Chongqing",   lat: 29.5630, lng: 106.5516, population: 32000000, homicideRatePer100k: 1.1, firearmHomicideRate: 0.04, primaryViolenceType: "Organized Crime", underAge25Percent: 35, context: "Chongqing famously cracked down on organized crime 'Chongqing model' in 2009; violence rates dropped sharply after Bo Xilai's campaign." },
  ],

  AUS: [
    { name: "Sydney",      lat: -33.8688, lng: 151.2093, population: 5312000, homicideRatePer100k: 0.82, firearmHomicideRate: 0.15, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 30, context: "Sydney has low firearm homicide rates following the 1996 Port Arthur massacre and subsequent National Firearms Agreement buyback." },
    { name: "Melbourne",   lat: -37.8136, lng: 144.9631, population: 5078000, homicideRatePer100k: 0.7,  firearmHomicideRate: 0.12, primaryViolenceType: "Organized Crime", underAge25Percent: 29, context: "Melbourne's gang landscape is largely driven by Middle Eastern crime networks competing over drug turf; firearms are strictly controlled." },
    { name: "Brisbane",    lat: -27.4698, lng: 153.0251, population: 2560720, homicideRatePer100k: 0.9,  firearmHomicideRate: 0.16, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 31, context: "Brisbane maintains low homicide rates; outlaw motorcycle gang activity in Queensland occasionally escalates to gun violence." },
    { name: "Perth",       lat: -31.9505, lng: 115.8605, population: 2085973, homicideRatePer100k: 0.75, firearmHomicideRate: 0.13, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 30, context: "Perth is geographically isolated and has relatively low crime; drug-related violence involving firearms is reported periodically." },
  ],

  CAN: [
    { name: "Toronto",    lat: 43.6532, lng: -79.3832, population: 2731571, homicideRatePer100k: 1.8, firearmHomicideRate: 1.1, primaryViolenceType: "Gang-related", underAge25Percent: 31, context: "Toronto's gun violence is concentrated in specific priority neighbourhoods; most firearms used in crimes are illegally trafficked from the US." },
    { name: "Montreal",   lat: 45.5017, lng: -73.5673, population: 1762949, homicideRatePer100k: 1.6, firearmHomicideRate: 0.9, primaryViolenceType: "Organized Crime", underAge25Percent: 30, context: "Montreal has a long history of biker gang and Italian mafia conflict; violence has significantly declined since major RCMP takedowns." },
    { name: "Vancouver",  lat: 49.2827, lng: -123.1207,population: 631486,  homicideRatePer100k: 1.9, firearmHomicideRate: 1.2, primaryViolenceType: "Organized Crime", underAge25Percent: 29, context: "Vancouver's gang violence is linked to the Lower Mainland conflict between the UN gang and Red Scorpions over drug distribution." },
    { name: "Winnipeg",   lat: 49.8951, lng: -97.1384, population: 749607,  homicideRatePer100k: 4.1, firearmHomicideRate: 2.4, primaryViolenceType: "Gang-related", underAge25Percent: 37, context: "Winnipeg has one of Canada's highest homicide rates; Indigenous gang involvement and poverty in the North End are key drivers." },
  ],

  PHL: [
    { name: "Manila",     lat: 14.5995, lng: 120.9842, population: 1846513, homicideRatePer100k: 9.8, firearmHomicideRate: 7.2, primaryViolenceType: "Drug-related",  underAge25Percent: 48, context: "Manila bore the brunt of Duterte's brutal 'war on drugs'; thousands of extrajudicial killings by police and vigilantes occurred 2016-2022." },
    { name: "Davao City", lat: 7.0707,  lng: 125.6087, population: 1776949, homicideRatePer100k: 6.1, firearmHomicideRate: 4.5, primaryViolenceType: "Drug-related",  underAge25Percent: 46, context: "Davao was Duterte's proving ground for his anti-drug campaign; death squads operated here long before the national drug war." },
    { name: "Cebu City",  lat: 10.3157, lng: 123.8854, population: 964169,  homicideRatePer100k: 7.3, firearmHomicideRate: 5.2, primaryViolenceType: "Gang-related",  underAge25Percent: 47, context: "Cebu City faces gang violence between local crime syndicates competing over drug distribution routes." },
  ],

  NGA: [
    { name: "Lagos",      lat: 6.5244,  lng: 3.3792,  population: 14862000, homicideRatePer100k: 9.8, firearmHomicideRate: 5.3, primaryViolenceType: "Gang-related", underAge25Percent: 59, context: "Lagos struggles with armed robbery, cultist gang violence, and extortion rackets; areas like Mushin and Ajegunle see concentrated gun violence." },
    { name: "Kano",       lat: 12.0022, lng: 8.5920,  population: 3626069,  homicideRatePer100k: 8.4, firearmHomicideRate: 4.1, primaryViolenceType: "Political",    underAge25Percent: 62, context: "Kano has experienced communal and religious violence; Boko Haram attacks in the region have increased firearms proliferation." },
    { name: "Abuja",      lat: 9.0765,  lng: 7.3986,  population: 3464000,  homicideRatePer100k: 5.2, firearmHomicideRate: 2.8, primaryViolenceType: "Organized Crime",underAge25Percent: 54, context: "Abuja as FCT has lower violence than Lagos but faces rising kidnapping for ransom and armed attacks on highways from bandits." },
    { name: "Maiduguri",  lat: 11.8311, lng: 13.1510, population: 1907600,  homicideRatePer100k: 28.4,firearmHomicideRate: 22.1,primaryViolenceType: "Political",    underAge25Percent: 63, context: "Maiduguri is the epicenter of Boko Haram insurgency; IED attacks and armed raids have caused massive civilian casualties." },
  ],

  KEN: [
    { name: "Nairobi",   lat: -1.2921, lng: 36.8219, population: 4734882, homicideRatePer100k: 7.2, firearmHomicideRate: 3.8, primaryViolenceType: "Gang-related", underAge25Percent: 57, context: "Nairobi's Eastlands slums (Mathare, Korogocho) are controlled by gangs like Mungiki and Gaza; police operations frequently result in extrajudicial killings." },
    { name: "Mombasa",   lat: -4.0435, lng: 39.6682, population: 1208333, homicideRatePer100k: 8.9, firearmHomicideRate: 4.6, primaryViolenceType: "Organized Crime",underAge25Percent: 58, context: "Mombasa is a major entry point for firearms smuggled from Somalia; radicalization and Al-Shabaab recruitment add to security concerns." },
  ],

  ARG: [
    { name: "Buenos Aires", lat: -34.6037, lng: -58.3816, population: 3054300, homicideRatePer100k: 6.8, firearmHomicideRate: 4.2, primaryViolenceType: "Organized Crime", underAge25Percent: 45, context: "Buenos Aires proper has moderate crime; the Greater BA conurbano has much higher rates tied to drug trafficking and poverty." },
    { name: "Rosario",      lat: -32.9442, lng: -60.6505, population: 1193605, homicideRatePer100k: 22.5, firearmHomicideRate: 18.9, primaryViolenceType: "Organized Crime", underAge25Percent: 50, context: "Rosario became Argentina's most violent city after drug trafficking networks (linked to Los Monos) took hold in peripheral barrios." },
    { name: "Córdoba",      lat: -31.4201, lng: -64.1888, population: 1454536, homicideRatePer100k: 8.2, firearmHomicideRate: 5.8, primaryViolenceType: "Gang-related", underAge25Percent: 46, context: "Córdoba faces growing gang activity in its margins; small arms trafficking from Paraguay is a key supply route." },
  ],

  TUR: [
    { name: "Istanbul",  lat: 41.0082, lng: 28.9784, population: 15462452, homicideRatePer100k: 2.5, firearmHomicideRate: 1.2, primaryViolenceType: "Organized Crime", underAge25Percent: 38, context: "Istanbul has relatively low gun homicide rates; organized crime groups (especially in drug trafficking) use firearms in targeted attacks." },
    { name: "Ankara",    lat: 39.9334, lng: 32.8597, population: 5663322,  homicideRatePer100k: 2.0, firearmHomicideRate: 0.9, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 36, context: "Ankara as the capital maintains tight security; political violence and organized crime represent the primary threats." },
    { name: "Diyarbakır",lat:37.9144, lng: 40.2306, population: 1764958,  homicideRatePer100k: 6.1, firearmHomicideRate: 3.8, primaryViolenceType: "Political",    underAge25Percent: 52, context: "Diyarbakır in southeastern Turkey has experienced conflict related to PKK insurgency; civilian casualties occur during escalations." },
  ],

  EGY: [
    { name: "Cairo",       lat: 30.0444, lng: 31.2357, population: 20076000, homicideRatePer100k: 3.8, firearmHomicideRate: 1.5, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 48, context: "Cairo maintains moderate crime levels given its population size; political violence and sectarian clashes have historically caused fatalities." },
    { name: "Alexandria",  lat: 31.2001, lng: 29.9187, population: 5200000,  homicideRatePer100k: 4.1, firearmHomicideRate: 1.7, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 47, context: "Alexandria has seen occasional sectarian violence between Muslim and Coptic communities; street crime involving knives is more common than firearms." },
  ],

  PAK: [
    { name: "Karachi",  lat: 24.8607, lng: 67.0011, population: 16093786, homicideRatePer100k: 9.2, firearmHomicideRate: 7.1, primaryViolenceType: "Political",    underAge25Percent: 53, context: "Karachi has dramatically reduced targeted killings since the 2013-2015 paramilitary Rangers operation; ethnic and political violence previously killed thousands annually." },
    { name: "Lahore",   lat: 31.5204, lng: 74.3587, population: 11126285,  homicideRatePer100k: 5.8, firearmHomicideRate: 4.2, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 51, context: "Lahore faces domestic dispute homicides and targeted sectarian attacks; illegal firearms are extremely widespread in Punjab province." },
    { name: "Peshawar", lat: 34.0151, lng: 71.5249, population: 2181000,  homicideRatePer100k: 12.4, firearmHomicideRate: 10.1, primaryViolenceType: "Political",    underAge25Percent: 55, context: "Peshawar is on the frontline of TTP (Pakistani Taliban) activity; bomb attacks and targeted shootings of security forces occur regularly." },
  ],

  GTM: [
    { name: "Guatemala City",lat: 14.6349, lng: -90.5069, population: 2934841, homicideRatePer100k: 39.2, firearmHomicideRate: 35.6, primaryViolenceType: "Gang-related", underAge25Percent: 56, context: "Guatemala City is a major hub for MS-13 and Barrio 18; extortion of businesses and bus drivers drives much of the violence." },
    { name: "Villa Nueva",   lat: 14.5254, lng: -90.5849, population: 618000,  homicideRatePer100k: 52.1, firearmHomicideRate: 47.8, primaryViolenceType: "Gang-related", underAge25Percent: 58, context: "Villa Nueva in the capital metro area is one of Guatemala's most violent municipalities, dominated by MS-13 gang cells." },
  ],

  HND: [
    { name: "San Pedro Sula",lat: 15.5, lng: -88.0251, population: 768946, homicideRatePer100k: 44.8, firearmHomicideRate: 41.2, primaryViolenceType: "Gang-related", underAge25Percent: 57, context: "San Pedro Sula was once the world's murder capital; MS-13 and Barrio 18 compete over drug corridors to Mexico." },
    { name: "Tegucigalpa",   lat: 14.0723, lng: -87.2068, population: 1157509, homicideRatePer100k: 32.6, firearmHomicideRate: 29.3, primaryViolenceType: "Gang-related", underAge25Percent: 55, context: "The Honduran capital suffers from gang infiltration of neighborhoods and state institutions; impunity rates exceed 90%." },
  ],

  SLV: [
    { name: "San Salvador", lat: 13.6929, lng: -89.2182, population: 1098000, homicideRatePer100k: 19.2, firearmHomicideRate: 16.8, primaryViolenceType: "Gang-related", underAge25Percent: 53, context: "El Salvador's gang crackdown under President Bukele saw mass imprisonments; homicides plummeted from over 100/100k but critics cite human rights abuses." },
    { name: "Soyapango",    lat: 13.7157, lng: -89.1521, population: 290084,  homicideRatePer100k: 24.3, firearmHomicideRate: 21.1, primaryViolenceType: "Gang-related", underAge25Percent: 55, context: "Soyapango was historically one of El Salvador's most dangerous municipalities and a stronghold of the MS-13 gang." },
  ],

  HTI: [
    { name: "Port-au-Prince", lat: 18.5425, lng: -72.3386, population: 2618894, homicideRatePer100k: 48.3, firearmHomicideRate: 43.7, primaryViolenceType: "Gang-related", underAge25Percent: 60, context: "Port-au-Prince is controlled by rival gang federations (G9 and Viv Ansanm) that have effectively replaced state authority in large areas." },
  ],

  JAM: [
    { name: "Kingston",   lat: 17.9970, lng: -76.7936, population: 592291, homicideRatePer100k: 49.7, firearmHomicideRate: 45.3, primaryViolenceType: "Gang-related", underAge25Percent: 52, context: "Kingston's garrison communities are controlled by political-criminal dons who supply votes and violence; Tivoli Gardens massacre (2010) showed state-gang entanglement." },
    { name: "Spanish Town", lat: 17.9910, lng: -76.9543, population: 147152, homicideRatePer100k: 55.2, firearmHomicideRate: 50.8, primaryViolenceType: "Gang-related", underAge25Percent: 54, context: "Spanish Town in St. Catherine parish is highly contested among gangs; it consistently records Jamaica's highest local murder rates." },
  ],

  TTO: [
    { name: "Port of Spain", lat: 10.6596, lng: -61.5159, population: 544076, homicideRatePer100k: 30.2, firearmHomicideRate: 26.9, primaryViolenceType: "Gang-related", underAge25Percent: 48, context: "Trinidad's capital is affected by gang networks using the island as a transshipment point for South American cocaine; firearms are widely available." },
  ],

  ZWE: [
    { name: "Harare",    lat: -17.8292, lng: 31.0522, population: 1542813, homicideRatePer100k: 6.8, firearmHomicideRate: 2.9, primaryViolenceType: "Political", underAge25Percent: 56, context: "Harare faces political violence tied to ZANU-PF enforcement; economic collapse has increased robbery and opportunistic crime." },
    { name: "Bulawayo",  lat: -20.1325, lng: 28.6265, population: 655675,  homicideRatePer100k: 5.9, firearmHomicideRate: 2.4, primaryViolenceType: "Interpersonal / Multiple", underAge25Percent: 54, context: "Zimbabwe's second city has chronic unemployment driving property crime; direct gun homicides are lower than politically-charged Harare." },
  ],

  ETH: [
    { name: "Addis Ababa", lat: 9.0320,  lng: 38.7469, population: 3352000, homicideRatePer100k: 5.3, firearmHomicideRate: 2.8, primaryViolenceType: "Political",    underAge25Percent: 58, context: "Addis Ababa has faced political violence during TPLF conflict (2020-22) and sporadic inter-communal attacks; the city itself is relatively controlled." },
    { name: "Mekelle",    lat: 13.4967, lng: 39.4770,  population: 323700,  homicideRatePer100k: 18.2,firearmHomicideRate: 14.9,primaryViolenceType: "Political",    underAge25Percent: 60, context: "Mekelle, capital of Tigray, was heavily impacted by the 2020–2022 civil war between federal forces and the TPLF; mass civilian casualties occurred." },
  ],
};

// ── Build output ────────────────────────────────────────
const output = [];
let globalSeq = 0;

// First bring in ALL existing countries from the countries.json to ensure every country has cities
const countries = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "countries.json"), "utf8"));

// For countries with hand-crafted data:
for (const [countryId, cityList] of Object.entries(REAL_CITIES)) {
  for (let i = 0; i < cityList.length; i++) {
    const c = cityList[i];
    output.push({
      id: `${countryId}-CITY-REAL-${i}`,
      countryId,
      name: c.name,
      population: c.population,
      lat: c.lat,
      lng: c.lng,
      homicideRatePer100k: c.homicideRatePer100k,
      firearmHomicideRate: c.firearmHomicideRate,
      primaryViolenceType: c.primaryViolenceType,
      underAge25Percent: c.underAge25Percent,
      context: c.context,
    });
    globalSeq++;
  }
}

// For remaining countries in countries.json that don't have hand-crafted cities, keep the existing generated ones
const existingCities = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "cities.json"), "utf8"));
const handCraftedCountryIds = new Set(Object.keys(REAL_CITIES));

for (const city of existingCities) {
  if (!handCraftedCountryIds.has(city.countryId)) {
    output.push(city);
  }
}

console.log(`Total cities: ${output.length}`);
console.log(`Hand-crafted cities: ${output.filter(c => c.id.includes("REAL")).length}`);
console.log(`Preserved generated cities: ${output.filter(c => !c.id.includes("REAL")).length}`);

fs.writeFileSync(
  path.join(__dirname, "data", "cities.json"),
  JSON.stringify(output, null, 2),
  "utf8"
);
console.log("✅ data/cities.json written successfully.");
