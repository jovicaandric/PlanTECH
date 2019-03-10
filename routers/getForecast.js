const forecast = require("./weatherApi");
const connectionDB = require('./connection');
var dataP;
module.exports.getForecastPlantages = function () {
  connectionDB.getAllPlantages(function (data) {
    var plantages = JSON.parse(data.plantages);
        for(var i = 0; i < plantages.length; i++) {
            var pId = plantages[i].Id;
            var lat = JSON.parse(plantages[i].Path)[0].lat;
            var lng = JSON.parse(plantages[i].Path)[0].lng;

            getForecast(lat, lng, pId, (id) => { 
            });
        }
    });
}

function getForecast(latitude, longitude, pId, callback) {
    var id = pId;
    forecast.getDaily(latitude, longitude, function (jsonDaily) {
        var daily = JSON.parse(jsonDaily);
        var values = {
            PlantageId: id,
            Date: daily[0].time,
            MinTemp: daily[0].temperatureMin,
            MaxTemp: daily[0].temperatureMax,
            PrecipProbability: daily[0].precipIntensity
        }
        connectionDB.addForecast(values, function(data) {
        });
    });
}
