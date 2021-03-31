const WIND_DIRECTIONS = ['North', 'North-northeast', 'Northeast', 'East-northeast',
    'East', 'East-southeast', 'Southeast', 'South-southeast',
    'South', 'South-southwest', 'Southwest', 'West-southwest',
    'West', 'West-northwest', 'Northwest', 'North-northwest',
];
function getCloudsFromPercents(percents) {
    const CLOUDS = ['Clear sky', 'Few clouds', 'Scattered clouds',
        'Broken clouds', 'Overcast clouds',
    ];
    if (percents < 11) {
        return CLOUDS[0];
    } else if (percents < 25) {
        return CLOUDS[1];
    } else if (percents < 50) {
        return CLOUDS[2];
    } else if (percents < 85) {
        return CLOUDS[3];
    }
    return CLOUDS[4];
}
const ICONS_DIR = '/icons/weather/';
const ICONS_EXT = '.svg';

module.exports.parse = function (json) {
    return {
        name: json.name,
        temp: Math.round(json.main.temp),
        icon: ICONS_DIR + json.weather[0].icon + ICONS_EXT,
        characteristics: {
            wind: {
                speed: json.wind.speed.toFixed(1),
                direction: WIND_DIRECTIONS[Math.round(json.wind.deg / 22.5)]
            },
            clouds: getCloudsFromPercents(json.clouds.all),
            pressure: json.main.pressure,
            humidity: json.main.humidity,
            coords: {
                lat: json.coord.lat.toFixed(2),
                lon: json.coord.lon.toFixed(2)
            }
        }
    }
};
