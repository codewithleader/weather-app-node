require('dotenv').config();

const { inquirerMenu, pause, readInput, listCities, listHCities } = require('./helpers/inquirer');

const Searches = require('./models/search');

const main = async () => {
  const searches = new Searches();

  let opt;
  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        // Enter term to search for found cities:
        const term = await readInput('Enter a city:');

        // Get cities from API:
        const cities = await searches.cities(term);

        // id: id of the city selected.
        const id = await listCities(cities);
        if (id === '0') continue;

        const citySelected = cities.find(city => city.id === id);

        // Save in DB:
        searches.addHistory(citySelected);

        const { name, lat, lon, state, country } = citySelected;

        // Get weather from API:
        const weather = await searches.weatherCity(lat, lon);
        const { desc, min, max, temp } = weather;

        // Show results
        console.clear();
        console.log('\nInformation about the city:'.bgBlue);
        console.log();
        console.log(`City: ${name.green}`);
        console.log(`Latitude: ${lat}`);
        console.log(`Longitude: ${lon}`);
        console.log(`State: ${state.green}`);
        console.log(`Country: ${country.green}`);
        console.log('About the weather:');
        console.log(`Temperature: ${temp} °C`);
        console.log(`Description: ${desc.green}`);
        console.log(`Min temperature: ${min} °C`);
        console.log(`Max temperature: ${max} °C`);

        break;
      case 2:
        const citiesH = searches.getHistory();

        // id: id of the city selected.
        const idS = await listHCities(citiesH);
        if (idS === '0') continue;

        const cityHSelected = citiesH.find(city => city.idH === idS);

        const { nameH, latH, lonH, stateH, countryH } = cityHSelected;

        // Get weather from API:
        const weatherHistory = await searches.weatherHCity(latH, lonH);
        const { descH, minH, maxH, tempH } = weatherHistory;

        // Show results
        console.clear();
        console.log('\nInformation about the city:'.bgBlue);
        console.log();
        console.log(`City: ${nameH.green}`);
        console.log(`Latitude: ${latH}`);
        console.log(`Longitude: ${lonH}`);
        console.log(`State: ${stateH.green}`);
        console.log(`Country: ${countryH.green}`);
        console.log('About the weather:');
        console.log(`Temperature: ${tempH} °C`);
        console.log(`Description: ${descH.green}`);
        console.log(`Min temperature: ${minH} °C`);
        console.log(`Max temperature: ${maxH} °C`);

        break;
    }
    if (opt !== 0) await pause();
  } while (opt !== 0);
};

main();
