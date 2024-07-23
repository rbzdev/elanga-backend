// Chemin vers votre base de données GeoLite2-City
const dbPath = path.join(__dirname, 'GeoLite2-City.mmdb');

let lookup;

// Charger la base de données GeoLite2-City
maxmind.open(dbPath, (err, cityLookup) => {
    if (err) {
        console.error('Error opening MaxMind DB:', err);
        return;
    }
    lookup = cityLookup;
    console.log('MaxMind DB loaded successfully');
});

// Endpoint pour obtenir les villes d'un pays
app.get('/api/cities/:countryCode', (req, res) => {
    const countryCode = req.params.countryCode;

    if (!lookup) {
        return res.status(500).json({ error: 'Database not loaded' });
    }

    const cities = [];
    for (const [ip, location] of Object.entries(lookup.cache)) {
        if (location.country.iso_code === countryCode) {
            cities.push(location.city.names.en);
        }
    }

    res.json({ cities: Array.from(new Set(cities)) });
});
