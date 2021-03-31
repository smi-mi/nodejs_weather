const express = require('express');
const cors = require('cors');
const fetch = require("node-fetch");
const Pool = require('pg').Pool;

const urls = require('./urls');
const weather = require('./weather');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '123',
    port: 5432,
});
const app = express();
const port = 3000;
app.use(cors()); // needed to get request from localhost
app.use(express.static('static'));


app.get('/weather/city', (req, res) => {
    const city = req.query.q;
    fetch(urls.getByCity(city))
        .then(response => response.json())
        .then(json => res.json(weather.parse(json)))
        .catch(() => res.status(404).send('City not found'));
});

app.get('/weather/coordinates', (req, res) => {
    const coords = {
        lat: req.query.lat,
        lon: req.query.lon
    };
    fetch(urls.getByCoords(coords))
        .then(response => response.json())
        .then(json => res.json(weather.parse(json)))
        .catch(() => res.status(404).send('City not found'));
});

app.get('/favorites', (req, res) => {
    pool.query('SELECT * from favorites')
        .then(result => res.json(result.rows))
        .catch(() => res.sendStatus(500));
});

app.post('/favorites', (req, res) => {
    const city = req.query.q;
    pool.query('INSERT INTO favorites (city) VALUES ($1) RETURNING *', [city])
        .then(result => res.status(201).json(result.rows[0]))
        .catch(() => res.sendStatus(500));
});

app.delete('/favorites', (req, res) => {
    // TODO delete favorite from db
    const city = req.query.q;
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
