'use strict';

// server
const SERVER_URL = 'http://localhost:3000';
function weatherByCityURL(city) {
    let url = new URL(SERVER_URL + '/weather/city');
    url.searchParams.set('q', city);
    return url;
}
function weatherByCoordsUrl(coords) {
    let url = new URL(SERVER_URL + '/weather/coordinates');
    url.searchParams.set('lat', coords.lat);
    url.searchParams.set('lon', coords.lon);
    return url;
}
function favoritesUrl() {
    return new URL(SERVER_URL + '/favorites');
}
function addFavoriteUrl(city) {
    let url = favoritesUrl();
    url.searchParams.set('q', city);
    return url;
}
function deleteFavoriteUrl(id) {
    let url = favoritesUrl();
    url.searchParams.set('id', id);
    return url;
}
function iconUrl(icon) {
    return new URL(SERVER_URL + icon);
}

function checkCity(city) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', weatherByCityURL(city), false);
    xhr.send();
    return xhr.status === 200;
}

// local storage keys
const HERE_CITY = 'here-city';
const HERE_CITY_COORDS = 'here-city-coords';

// updating geolocation
function updateGeolocation() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            localStorage.setItem(HERE_CITY_COORDS, JSON.stringify({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
            }));
            location.reload();
        },
        () => {
            let city;
            do {
                city = prompt('Введите город по умолчанию');
            } while (!checkCity(city));
            localStorage.setItem(HERE_CITY, city);
            location.reload();
        });
}

// asking for geolocation or default city
if (localStorage.getItem(HERE_CITY) === null && localStorage.getItem(HERE_CITY_COORDS) === null) {
    updateGeolocation();
}

// DOM IDs and classes
const FAVORITE_LIST_ID = 'favorite-list';
const FAVORITE_EXAMPLE_ID = 'example';
const UPDATE_INFO_ID = 'here-city-update-info';
const UPDATE_INFO_FAVORITE_CLASS = 'update-favorite';
const HERE_CITY_MAIN_ID = 'weather-here-main-info';
const HERE_CITY_CHARACTERISTICS_ID = 'weather-here-characteristics';
const ADD_FAVORITE_FORM_ID = 'add-new-city';
const NEW_CITY_ID = 'new-city';
const UPDATE_BUTTON_CLASS = 'update-button';

// weather constants
const TEMP_METRIC = '\u00B0C';
const WIND_METRIC = 'm/s';
const PRESSURE_METRIC = 'hpa';
const HUMIDITY_METRIC = '%';

// filling weather info
function fillCharacteristics(characteristics, json) {
    characteristics[0].children[0].textContent = `${json.wind.speed} ${WIND_METRIC}, ${json.wind.direction}`;
    characteristics[1].children[0].textContent = json.clouds;
    characteristics[2].children[0].textContent = `${json.pressure} ${PRESSURE_METRIC}`;
    characteristics[3].children[0].textContent = `${json.humidity} ${HUMIDITY_METRIC}`;
    characteristics[4].children[0].textContent = `[${json.coords.lat}, ${json.coords.lon}]`;
}
function fillHereCity(json) {
    document.getElementById(UPDATE_INFO_ID).style.visibility = 'hidden';
    let mainInfo = document.getElementsByClassName(HERE_CITY_MAIN_ID)[0];
    let mainInfoElems = mainInfo.children;
    mainInfoElems[0].textContent = json.name;
    mainInfoElems[1].setAttribute('src', iconUrl(json.icon));
    mainInfoElems[2].textContent = json.temp + TEMP_METRIC;
    mainInfo.style.visibility = 'visible';
    let characteristics = document.getElementsByClassName(HERE_CITY_CHARACTERISTICS_ID)[0];
    fillCharacteristics(characteristics.children, json.characteristics);
    characteristics.style.visibility = 'visible';
}
function fillFavorite(info, json, favorite) {
    favorite.setAttribute('id', info.id);
    favorite.firstElementChild.remove();
    let header = favorite.firstElementChild.children;
    header[0].textContent = json.name;
    header[1].textContent = json.temp + TEMP_METRIC;
    header[2].setAttribute('src', iconUrl(json.icon));
    fillCharacteristics(favorite.lastElementChild.children, json.characteristics);
    favorite.style.visibility = "visible";
}

// remove favorite button
function removeFavorite() {
    this.disabled = true;
    let favorite = this.parentElement.parentElement;
    fetch(deleteFavoriteUrl(favorite.getAttribute('id')),{ method: 'DELETE' })
        .then(() => favorite.remove())
        .catch(error => alert(error));
}

// adding favorite to DOM
const FAVORITE_LIST_NODE = document.getElementById(FAVORITE_LIST_ID);
function addFavorite() {
    let example = document.getElementById(FAVORITE_EXAMPLE_ID);
    let favorite = example.content.firstElementChild.cloneNode(true);
    favorite.style.visibility = 'hidden';
    favorite.firstElementChild.lastElementChild.addEventListener('click', removeFavorite);
    let update_info = updateInfo.cloneNode(true);
    update_info.setAttribute('id', '');
    update_info.style.visibility = 'visible';
    update_info.classList.add(UPDATE_INFO_FAVORITE_CLASS);
    favorite.prepend(update_info);
    FAVORITE_LIST_NODE.append(favorite);
    return favorite;
}

// add favorite button with checking city validness
document.getElementById(ADD_FAVORITE_FORM_ID).addEventListener('submit', (event) => {
    event.preventDefault();
    let newCityField = document.getElementById(NEW_CITY_ID);
    let city = newCityField.value;
    newCityField.value = '';
    if (!checkCity(city)) {
        alert('Несуществующий город: ' + city);
        return;
    }
    let favorite = addFavorite();
    let info;
    fetch(addFavoriteUrl(city), { method: 'POST' })
        .then(response => response.json())
        .then(json => {
            info = json;
            return fetch(weatherByCityURL(info.city));
        })
        .then(response => response.json())
        .then(json => fillFavorite(info, json, favorite))
        .catch(() => favorite.remove());
});

// update buttons
for (let b of document.getElementsByClassName(UPDATE_BUTTON_CLASS)) {
    b.addEventListener('click', updateGeolocation);
}

// hiding here-city info
let updateInfo = document.getElementById(UPDATE_INFO_ID);
updateInfo.style.visibility = 'visible';
let mainInfo = document.getElementsByClassName(HERE_CITY_MAIN_ID)[0];
let characteristics = document.getElementsByClassName(HERE_CITY_CHARACTERISTICS_ID)[0];
mainInfo.style.visibility = 'hidden';
characteristics.style.visibility = 'hidden';

// getting weather for here-city
if (localStorage.getItem(HERE_CITY) !== null) {
    let hereCityUrl = weatherByCityURL(localStorage.getItem(HERE_CITY));
    fetch(hereCityUrl)
        .then(response => response.json())
        .then(json => fillHereCity(json))
        .catch(error => alert(error));
} else if (localStorage.getItem(HERE_CITY_COORDS) !== null) {
    let hereCityUrl = weatherByCoordsUrl(JSON.parse(localStorage.getItem(HERE_CITY_COORDS)));
    fetch(hereCityUrl)
        .then(response => response.json())
        .then(json => fillHereCity(json))
        .catch(error => alert(error));
}

// updating favorites
fetch(favoritesUrl())
    .then(response => response.json())
    .then(favorites => {
        for (const f of favorites) {
            let favorite = addFavorite();
            console.log(favorite);
            fetch(weatherByCityURL(f.city))
                .then(res => res.json())
                .then(json => fillFavorite(f, json, favorite))
                .catch(error => alert(error));
        }
    })
    .catch(error => alert(error));
