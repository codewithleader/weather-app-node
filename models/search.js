const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class Searches {
  history = [];
  dbPath = './db/database.json';

  constructor() {
    this.readDB();
  }

  getHistory() {
    return this.history;
  }

  get paramsGeocoding() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      lang: 'es',
      limit: 5,
    };
  }

  get paramsWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric',
      lang: 'es',
    };
  }

  // term: term of search. It can be a city or a place.
  async cities(term = '') {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/geo/1.0/direct?q=${term}`,
        params: this.paramsGeocoding,
      });

      const resp = await instance.get();

      return resp.data.map(({ name, lat, lon, state, country }) => ({
        id: uuidv4(),
        name,
        lat,
        lon,
        state: state || 'state not found',
        country,
      }));
    } catch (error) {
      return [];
    }
  }

  async weatherCity(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsWeather, lat, lon },
      });

      const resp = await instance.get();
      const { main, weather } = resp.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log(`An error here! => ${error}`);
    }
  }

  async weatherHCity(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsWeather, lat, lon },
      });

      const resp = await instance.get();
      const { main, weather } = resp.data;

      return {
        descH: weather[0].description,
        minH: main.temp_min,
        maxH: main.temp_max,
        tempH: main.temp,
      };
    } catch (error) {
      console.log(`An error here! => ${error}`);
    }
  }

  addHistory(city = {}) {
    const cityHistory = {
      idH: `${city.lat}${city.lon}`,
      nameH: city.name,
      latH: city.lat,
      lonH: city.lon,
      stateH: city.state,
      countryH: city.country,
    };
    if (this.history.some(c => c.idH.includes(cityHistory.idH))) return;

    this.history = this.history.splice(0, 5);

    // Add to history
    this.history.unshift(cityHistory);

    // Save to DB
    this.saveDB();
  }

  saveDB() {
    const payload = {
      history: this.history,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  readDB() {
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath, { encoding: 'utf8' });
    const data = JSON.parse(info);
    this.history = data.history;
  }
}

module.exports = Searches;
