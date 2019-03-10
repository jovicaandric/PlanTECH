var exports = module.exports = {};
const ForecastIo = require('forecastio');
const key = '2a71224704a622e5dbfb9651a06213bd';
const forecast = new ForecastIo(key);

var optional = {
    lang: 'sr',
    units: 'si',
};

exports.getWeather = function (latitude, longitude, callback) {
    forecast.forecast(latitude, longitude, optional).then(function (data) {

        var hourly = data.hourly.data;
        var json = JSON.stringify(hourly);

        callback(json);
    });
}

exports.getDaily = function (latitude, longitude, callback) {
    forecast.forecast(latitude, longitude, optional).then(function (data) {
        var daily = data.daily.data;
        var jsonDaily = JSON.stringify(daily);

        callback(jsonDaily);

    });
}

exports.getDailyP = function (latitude, longitude, plantageId, callback) {
    forecast.forecast(latitude, longitude, optional).then(function (data) {
        var daily = data.daily.data;
        var jsonDaily = JSON.stringify(daily);

        callback(jsonDaily);
    });
}