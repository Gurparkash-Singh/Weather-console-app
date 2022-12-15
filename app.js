const request = require("request");
const dotenv = require("dotenv").config();
const yargs = require("yargs")

const argv = yargs.options({
	a: {
		demand: true,
		alias: 'address',
		describe: 'Address to fetch weather for',
		string: true
	}
}).help().alias('help', 'h')
.version().alias('version', 'v').argv;

const address = encodeURIComponent(argv.address);

request(
    `http://www.mapquestapi.com/geocoding/v1/address?key=${process.env.API_KEY}&location=${address}`,
    (err, res, body) => {
        if (err)
        {
            console.log(err);
            return;
        }
        const result = JSON.parse(body);
        const country = result.results[0].locations[0].adminArea1;
        if (country != "US")
        {
            console.log("We can only handle request for US");
            console.log("Weather for " + country + " is not yet available");
            return;
        }
        const lat = result.results[0].locations[0].latLng.lat;
        const lang = result.results[0].locations[0].latLng.lng;
        const url = `https://api.weather.gov/points/${lat},${lang}`;
        const headers = {
            'User-Agent': ('myweatherapp', 'singhgk.fateh@gmail.com')
        };
        request({url, headers}, (err, res, body) => {
            if (err)
            {
                console.log(err);
                return;
            }
            const result = JSON.parse(body);
            const url = result.properties.forecastHourly;
            request({url, headers},(err, res, body) => {
                if (err)
                {
                    console.log(err);
                    return;
                }
                const result = JSON.parse(body);
                const temp = result.properties.periods[0].temperature;
                console.log(`The temperture is ${temp}ºF`);
                const cTemp = Math.round((5/9) * (temp - 32));
                console.log(`The temperture is ${cTemp}ºC`);
            });
        });
    }
);
