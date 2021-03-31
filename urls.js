// api data
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const API_KEY_PARAM_NAME = 'appid';
const API_KEY = 'b837cfa721addad4d37a808828acf5df';
const UNITS_NAME = 'units';
const UNITS_VALUE = 'metric';

module.exports.getByCity = function (city) {
    let weatherUrl = new URL(API_URL);
    weatherUrl.searchParams.set(API_KEY_PARAM_NAME, API_KEY);
    weatherUrl.searchParams.set(UNITS_NAME, UNITS_VALUE);
    weatherUrl.searchParams.set('q', city);
    return weatherUrl;
};

module.exports.getByCoords = function (coords) {
    let weatherUrl = new URL(API_URL);
    weatherUrl.searchParams.set(API_KEY_PARAM_NAME, API_KEY);
    weatherUrl.searchParams.set(UNITS_NAME, UNITS_VALUE);
    weatherUrl.searchParams.set('lat', coords.lat);
    weatherUrl.searchParams.set('lon', coords.lon);
    return weatherUrl;
};
