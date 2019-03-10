
var connectionDB = require('../routers/connection.js');

module.exports.WriteMeasurements = function () {
  connectionDB.fakeSystemMeasurers(function (data) {
    var measurers = JSON.parse(data.measurers);
    for (var i = 0; i < measurers.length; i++) {
      var value = {
        "id": measurers[i].Id,
        "DateTime": Date.now(),
      };
      switch (measurers[i].MeasuringUnit) {
        case "Air Humidity":  //vlaznost vazduha
          value.Value = Math.random() * 100;  //%
          break;
        case "Ground Humidity":  //poljski vodni kapacitet
          value.Value = Math.random() * 70 + 30;  //%
          break;
        case "Ph": //kiselost
          value.Value = Math.random() * 6 + 3;
          break;
        case "CaCO3":  //kalcijum-karbonar
          value.Value = Math.random() * 10  //%
          break;
        case "N": //azot
          value.Value = Math.random() * 5 // mg/100g zemljista
          break;
        case "K2O": //kalijum
          value.Value = Math.random() * 40 // mg/100g zemljista
          break;
        case "P2O5": //fosfor
          value.Value = Math.random() * 40 // mg/100g zemljista
          break;
        case "GroundTemp": //temperatura zemlje
          value.Value = Math.random() * 40
          break;
        case "Hummus": //humus
          value.Value = Math.random() * 6
          break;
      }
      connectionDB.addMeasurement(value, (data) => {
      });
    }
  });
  //  console.log(value.ValueID+" "+value.DataValue+" " +value.DateTimeUTC);
}