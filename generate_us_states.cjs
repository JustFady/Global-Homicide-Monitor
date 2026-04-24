const fs = require('fs');
const https = require('https');

https.get('https://unpkg.com/us-atlas@3/states-10m.json', (res) => {
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    const topo = JSON.parse(rawData);
    const states = topo.objects.states.geometries;
    const usaHomicideAvg = 6.8;

    const data = states.map((s, i) => {
      const name = s.properties.name;
      // create some variance from the national average
      const mult = 0.5 + (Math.random() * 1.5);
      const h = parseFloat((usaHomicideAvg * mult).toFixed(1));
      const fh = parseFloat((h * (0.6 + Math.random() * 0.3)).toFixed(1));
      
      let strictness = "Moderate";
      if (['California', 'New York', 'Massachusetts', 'Illinois'].includes(name)) strictness = "Strict";
      if (['Texas', 'Florida', 'Arizona', 'Idaho', 'Montana'].includes(name)) strictness = "Permissive";

      // Approx coordinates based on grid just for points, though states usually map by polygons.
      return {
        id: `USA-${name.toUpperCase().replace(/\s+/g, '')}`,
        countryId: "USA",
        name: name,
        population: Math.floor(1000000 + Math.random() * 20000000),
        homicideRatePer100k: h,
        firearmHomicideRate: fh,
        organizedCrimeIndex: parseFloat((3.0 + Math.random() * 4).toFixed(1)),
        primaryViolenceType: Math.random() > 0.5 ? "Interpersonal" : "Gang-related",
        lawStrictness: strictness,
        underAge25Percent: parseFloat((20 + Math.random() * 15).toFixed(1)),
        context: `${name} has a varied urban-to-rural dynamic impacting its violence statistics.`,
      };
    });

    fs.writeFileSync('./data/us_states.json', JSON.stringify(data, null, 2));
    console.log(`Generated ${data.length} US states.`);
  });
}).on('error', (e) => {
  console.error(e);
});
