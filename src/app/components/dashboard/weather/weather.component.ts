import { Component, OnInit, Input } from '@angular/core';
import { WeatherModel } from './weather.model';
import { WeatherService } from "../../../services/weather.service";
import { nvD3 } from 'ng2-nvd3';
import { Router } from '@angular/router';
declare let d3, nv: any;
import { NgxChartsModule } from '@swimlane/ngx-charts';
declare var require: any;
import { DayWeather } from "./day.model";
declare let Plotly: any;
import { AuthService } from "../../../services/auth.service";
declare var $: any;
@Component({
  selector: 'app-weather',
  providers: [WeatherService],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})


export class WeatherComponent implements OnInit {
  private longitude;
  private latitude;
  private days: any[] = [];
  private currentTemp;
  private daysWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  private locationCurrent;
  private summary;
  private precip;
  private humidity;
  private windSpeed;
  private todayIcon;
  private todayDay;
  private hours;
  private dataGraph = [];
  private search = "";
  private wind: any[] = [];
  private pressure;
  private cloudCover;
  private visibility;

  geocoder = new google.maps.Geocoder;
  infowindow = new google.maps.InfoWindow;

  view: number[];
  // options Temp
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  showGridLines = false;
  showYAxisLabel = true;
  yAxisLabel = '°C';
  tooltipDisabled = false;
  usersPlantages: any[] = [];
  beggining = 0;
  colorScheme = {
    domain: ['#FFE167']
  };
  autoScale = true;
  myPosition: any;
  currentUser;

  init() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.showPosition(position);
    }, (error) => {
      var position = {
        coords: {
          latitude: null,
          longitude: null
        }
      };
      position.coords.latitude = 44.014167;
      position.coords.longitude = 20.911667;
      this.showPosition(position);
    });
  }

  showPosition(position) {

    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;
    var city;
    var latlng = { lat: this.latitude, lng: this.longitude };
    this.geocoder.geocode({ 'location': latlng }, (results, status) => {

      city = ((results[1].formatted_address).split(","))[0];
      this.locationCurrent = city;

    });
    this.getData();

  }

  constructor(private weatherService: WeatherService, private router: Router, private authService: AuthService) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);
    this.currentUser = JSON.parse(localStorage.getItem('user'));
    authService.getUsersPlantages(JSON.parse(localStorage.getItem('user'))).subscribe(data => {
      this.usersPlantages = JSON.parse(data.plantages);
    });
  }

  getDataForPlantage(selected) {
    var latitude;
    var longitude;
    var location;
    for (var i = 0; i < this.usersPlantages.length; i++) {
      //  alert(this.usersPlantages[i].Id + " " + selected);
      if (this.usersPlantages[i].Id == selected) {

        latitude = JSON.parse(this.usersPlantages[i].Path)[0].lat;
        longitude = JSON.parse(this.usersPlantages[i].Path)[0].lng;
        location = this.usersPlantages[i].Name;


      }
    }
    this.flag = 0;

    this.days.length = 0;
    this.wind.length = 0;
    var city;
    this.locationCurrent = location;
    var values: any[] = [];
    var historicalBarChart = [];
    var obj = {
      key: "u",
      values: []
    }
    var dataDaily = this.weatherService.getDaily(latitude, longitude)
      .subscribe(daily => {

        this.days = [];
        for (var i = 1; i < 7; i++) {
          var image;

          switch (daily[i].icon) {
            case "wind":
              image = require('./images/wind.png');
              break;
            case "cloudy":
              image = require('./images/cloudy.png');
              break;
            case "fog":
              image = require('./images/fog.png');
              break;
            case "clear-day":
            case "clear-night":
              image = require('./images/clear-day.png');
              break;
            case "snow":
              image = require('./images/snow.png');
              break;
            case "sleet":
              image = require('./images/sleet.png');
              break;
            case "rain":
              image = require('./images/rain.png');
              break;
            case "partly-cloudy-day":
            case "partly-cloudy-night":
              image = require('./images/partly-cloudy-day.png');
              break;
          }

          var day = {
            maxTemp: Math.round(daily[i].temperatureMax),
            minTemp: Math.round(daily[i].temperatureMin),
            day: (this.daysWeek[new Date(+daily[i].time * 1000).getDay()]).substring(0, 3),
            icon: image
          }

          this.days.push(day);
        }

        var dataHourly = this.weatherService.getWeatherFromServer(latitude, longitude)
          .subscribe(haurly => {
            this.currentTemp = Math.round(haurly[0].temperature);
            this.humidity = Math.round(haurly[0].humidity * 100);
            this.summary = haurly[0].summary;
            this.precip = Math.round(haurly[0].precip * 100);
            this.windSpeed = haurly[0].windSpeed;

            var image;

            switch (haurly[0].icon) {
              case "wind":
                image = require('./images/wind.png');
                break;
              case "cloudy":
                image = require('./images/cloudy.png');
                break;
              case "fog":
                image = require('./images/fog.png');
                break;
              case "clear-day":
              case "clear-night":
                image = require('./images/clear-day.png');
                break;
              case "snow":
                image = require('./images/snow.png');
                break;
              case "sleet":
                image = require('./images/sleet.png');
                break;
              case "rain":
                image = require('./images/rain.png');
                break;
              case "partly-cloudy-day":
              case "partly-cloudy-night":
                image = require('./images/partly-cloudy-day.png');
                break;
            }
            this.todayIcon = image;
            this.todayDay = this.daysWeek[new Date().getDay()];
            this.hours = new Date().getHours() + ":00";
            



            //wind

            this.wind = [];
            for (var i = 1; i < 12; i += 3) {
              var imageArrow;
              var bearing = haurly[i].windBearing;
              if (bearing > 67.5 && bearing <= 112.5)
                imageArrow = require("./windImages/left.png");
              else if (bearing > 112.5 && bearing <= 157.5)
                imageArrow = require("./windImages/left-top.png");
              else if (bearing > 157.5 && bearing <= 202.5)
                imageArrow = require("./windImages/top.png");
              else if (bearing > 202.5 && bearing <= 247.5)
                imageArrow = require("./windImages/right-top.png");
              else if (bearing > 247.5 && bearing <= 292.5)
                imageArrow = require("./windImages/right.png");
              else if (bearing > 292.5 && bearing <= 337.5)
                imageArrow = require("./windImages/right-bottom.png");
              else if ((bearing > 337.5 && bearing <= 360) || (bearing >= 0 && bearing <= 22.5))
                imageArrow = require("./windImages/bottom.png");
              else if (bearing > 22.5 && bearing <= 67.5)
                imageArrow = require("./windImages/letf-bottom.png");

              this.wind.push({
                "time": new Date(+haurly[i].time * 1000).getHours() + ":00 h",
                "speed": Math.round(haurly[i].windSpeed * 3.6) + " km/h",
                "direction": haurly[i].windBearing,
                "image": imageArrow
              })
            }
            //wind

            //precip
            var x1 = []; var y1 = [];
            var annotationContent = [];
            this.pressure = haurly[0].pressure + " Mb";
            this.cloudCover = Math.round(haurly[0].cloudCover * 100) + "%";
            this.visibility = haurly[0].visibility + " Km";

            for (var i = 0; i < 18; i += 2) {
              var date = new Date(+haurly[i].time * 1000);
              var prec = Math.round(haurly[i].precipProbability * 100);
              var value = {
                "label": date.getDate() + "/ " + date.getMonth() + " " + date.getHours() + ":00",
                "value": prec
              }
              x1.push(date.getHours() + ":00");
              y1.push(prec);
              obj.values.push(value);
              var result = {
                x: date.getHours() + ":00",
                y: prec,
                text: prec + "%",
                xanchor: 'center',
                yanchor: 'bottom',
                showarrow: false
              };
              annotationContent.push(result);

            }
            historicalBarChart.push(obj);
            var trace1 = {
              x: x1,
              y: y1,
              type: 'bar',
              marker: {
                color: 'rgb(158,202,225)',
                opacity: 0.6,
                line: {
                  color: 'rbg(8,48,107)',
                  width: 1.5
                }
              }
            };

            var data1 = [trace1];
            var layout1 = {
              annotations: annotationContent,
              margin: {
                b: 23,
                l: 23,
                r: 10,
                t: 10
              },
              xaxis: {
                showgrid: false,

              },
              yaxis: {
                showgrid: false,
                showline: false,
                showticklabels: false
              }
            };
            Plotly.newPlot('myDiv1', data1, layout1, { staticPlot: true });
            /*
            nv.addGraph(function () {
              var chart = nv.models.discreteBarChart()
                .x(function (d) { return d.label })
                .y(function (d) { return d.value })
                .color(['#aec7e8'])
                .staggerLabels(false)
                //.staggerLabels(historicalBarChart[0].values.length > 8)
                .showValues(true)
                .duration(250)
                ;
              d3.select('#chart1 svg')
                .datum(historicalBarChart)
                .call(chart);
              nv.utils.windowResize(chart.update);
              return chart;
            });*/

            //PRECIP

            //temperature graph
            var sin = []; var x = []; var y = [];
            for (var i = 0; i < 24; i += 3) {
              let time: any;
              time = (new Date(+haurly[i].time * 1000));
              var day = time.getDate();
              var month = time.getMonth();
              var hours = time.getHours();
              var datum = hours + ":00";
              let precip: any;
              let temp: any;
              temp = Math.round(haurly[i].temperature);
              sin.push({ name: datum, value: temp });
              x.push(datum);
              y.push(temp);
              // console.log("prepP="+haurly[i].precipProbability * 100);
            }

            this.dataGraph =
              [
                {
                  name: "Temperatura °C",      //values - represents the array of {x,y} data points
                  series: sin
                }
              ];
            var trace2 = {
              x: x,
              y: y,
              fill: 'tonexty',
              type: 'scatter',
              line: {
                // color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                color: "#FFE167",
                width: 2
              }
            };
            var data = [trace2];
            var layout = {
              margin: {
                b: 23,
                l: 23,
                r: 23,
                t: 10
              },
              xaxis: {
                showgrid: false,

                zeroline: false,
                showline: false,

              },
              yaxis: {
                showgrid: false,

              }
            };

            Plotly.newPlot('myDiv', data, layout, { displayModeBar: false });
            //temperature graph

          });

      });

    if (this.flag == 0) {
      this.flag = 1;
    }

  }


  ngOnInit() {

    this.init();
    // this.getPlantages();
  }



  codeAddress() {

    this.flag = 0;

    this.days = [];
    var address = this.search;
    this.geocoder.geocode({ 'address': address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        console.log("rez=" + results[0].geometry.location.lat());
        this.latitude = results[0].geometry.location.lat();
        this.longitude = results[0].geometry.location.lng();

        this.getData();
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });

  }

  flag = 0;

  getData() {

    this.flag = 0;

    this.days.length = 0;
    this.wind.length = 0;
    var city;
    this.locationCurrent = "";
    var values: any[] = [];
    var historicalBarChart = [];
    var obj = {
      key: "u",
      values: []
    }

    var latlng = { lat: this.latitude, lng: this.longitude };
    this.geocoder.geocode({ 'location': latlng }, (results, status) => {

      city = ((results[1].formatted_address).split(","))[0];
      if (this.beggining == 0) {
        this.locationCurrent = city;
        this.beggining = 1;
      }
      else this.locationCurrent = this.titleCase(this.search);

    });



    var dataDaily = this.weatherService.getDaily(this.latitude, this.longitude)
      .subscribe(daily => {

        this.days = [];
        for (var i = 1; i < 7; i++) {
          var image;

          switch (daily[i].icon) {
            case "wind":
              image = require('./images/wind.png');
              break;
            case "cloudy":
              image = require('./images/cloudy.png');
              break;
            case "fog":
              image = require('./images/fog.png');
              break;
            case "clear-day":
            case "clear-night":
              image = require('./images/clear-day.png');
              break;
            case "snow":
              image = require('./images/snow.png');
              break;
            case "sleet":
              image = require('./images/sleet.png');
              break;
            case "rain":
              image = require('./images/rain.png');
              break;
            case "partly-cloudy-day":
            case "partly-cloudy-night":
              image = require('./images/partly-cloudy-day.png');
              break;
          }

          var day = {
            maxTemp: Math.round(daily[i].temperatureMax),
            minTemp: Math.round(daily[i].temperatureMin),
            day: (this.daysWeek[new Date(+daily[i].time * 1000).getDay()]).substring(0, 3),
            icon: image
          }

          this.days.push(day);
        }

        var dataHourly = this.weatherService.getWeatherFromServer(this.latitude, this.longitude)
          .subscribe(haurly => {
            this.currentTemp = Math.round(haurly[0].temperature);
            this.humidity = Math.round(haurly[0].humidity * 100);
            this.summary = haurly[0].summary;
            this.precip = Math.round(haurly[0].precip * 100);
            this.windSpeed = haurly[0].windSpeed;

            var image;

            switch (haurly[0].icon) {
              case "wind":
                image = require('./images/wind.png');
                break;
              case "cloudy":
                image = require('./images/cloudy.png');
                break;
              case "fog":
                image = require('./images/fog.png');
                break;
              case "clear-day":
              case "clear-night":
                image = require('./images/clear-day.png');
                break;
              case "snow":
                image = require('./images/snow.png');
                break;
              case "sleet":
                image = require('./images/sleet.png');
                break;
              case "rain":
                image = require('./images/rain.png');
                break;
              case "partly-cloudy-day":
              case "partly-cloudy-night":
                image = require('./images/partly-cloudy-day.png');
                break;
            }
            this.todayIcon = image;
            this.todayDay = this.daysWeek[new Date().getDay()];
            this.hours = new Date().getHours() + ":00";
            this.precip = haurly[0].precipProbability * 100;



            //wind

            this.wind = [];
            for (var i = 1; i < 12; i += 3) {
              var imageArrow;
              var bearing = haurly[i].windBearing;
              if (bearing > 67.5 && bearing <= 112.5)
                imageArrow = require("./windImages/left.png");
              else if (bearing > 112.5 && bearing <= 157.5)
                imageArrow = require("./windImages/left-top.png");
              else if (bearing > 157.5 && bearing <= 202.5)
                imageArrow = require("./windImages/top.png");
              else if (bearing > 202.5 && bearing <= 247.5)
                imageArrow = require("./windImages/right-top.png");
              else if (bearing > 247.5 && bearing <= 292.5)
                imageArrow = require("./windImages/right.png");
              else if (bearing > 292.5 && bearing <= 337.5)
                imageArrow = require("./windImages/right-bottom.png");
              else if ((bearing > 337.5 && bearing <= 360) || (bearing >= 0 && bearing <= 22.5))
                imageArrow = require("./windImages/bottom.png");
              else if (bearing > 22.5 && bearing <= 67.5)
                imageArrow = require("./windImages/letf-bottom.png");

              this.wind.push({
                "time": new Date(+haurly[i].time * 1000).getHours() + ":00 h",
                "speed": Math.round(haurly[i].windSpeed * 3.6) + " km/h",
                "direction": haurly[i].windBearing,
                "image": imageArrow
              })
            }
            //wind

            //precip
            var x1 = []; var y1 = [];
            var annotationContent = [];
            this.pressure = haurly[0].pressure + " Mb";
            this.cloudCover = Math.round(haurly[0].cloudCover * 100) + "%";
            this.visibility = haurly[0].visibility + " Km";

            for (var i = 0; i < 18; i += 2) {
              var date = new Date(+haurly[i].time * 1000);
              var prec = Math.round(haurly[i].precipProbability * 100);
              var value = {
                "label": date.getDate() + "/ " + date.getMonth() + " " + date.getHours() + ":00",
                "value": prec
              }
              x1.push(date.getHours() + ":00");
              y1.push(prec);
              obj.values.push(value);
              var result = {
                x: date.getHours() + ":00",
                y: prec,
                text: prec + "%",
                xanchor: 'center',
                yanchor: 'bottom',
                showarrow: false
              };
              annotationContent.push(result);

            }
            historicalBarChart.push(obj);
            var trace1 = {
              x: x1,
              y: y1,
              type: 'bar',
              marker: {
                color: 'rgb(158,202,225)',
                opacity: 0.6,
                line: {
                  color: 'rbg(8,48,107)',
                  width: 1.5
                }
              }
            };

            var data1 = [trace1];
            var layout1 = {
              margin: {
                b: 23,
                l: 23,
                r: 10,
                t: 10
              },
              annotations: annotationContent,
              xaxis: {
                showgrid: false,

              },
              yaxis: {
                showgrid: false,
                showline: false,
                showticklabels: false
              }
            };
            Plotly.newPlot('myDiv1', data1, layout1, { staticPlot: true });
            /*
            nv.addGraph(function () {
              var chart = nv.models.discreteBarChart()
                .x(function (d) { return d.label })
                .y(function (d) { return d.value })
                .color(['#aec7e8'])
                .staggerLabels(false)
                //.staggerLabels(historicalBarChart[0].values.length > 8)
                .showValues(true)
                .duration(250)
                ;
              d3.select('#chart1 svg')
                .datum(historicalBarChart)
                .call(chart);
              nv.utils.windowResize(chart.update);
              return chart;
            });*/

            //PRECIP

            //temperature graph
            var sin = []; var x = []; var y = [];
            for (var i = 0; i < 24; i += 3) {
              let time: any;
              time = (new Date(+haurly[i].time * 1000));
              var day = time.getDate();
              var month = time.getMonth();
              var hours = time.getHours();
              var datum = hours + ":00";
              let precip: any;
              let temp: any;
              temp = Math.round(haurly[i].temperature);
              sin.push({ name: datum, value: temp });
              x.push(datum);
              y.push(temp);
              // console.log("prepP="+haurly[i].precipProbability * 100);
            }

            this.dataGraph =
              [
                {
                  name: "Temperatura °C",      //values - represents the array of {x,y} data points
                  series: sin
                }
              ];
            var trace2 = {
              x: x,
              y: y,
              fill: 'tonexty',
              type: 'scatter',
              line: {
                // color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                color: "#FFE167",
                width: 2
              }
            };
            var data = [trace2];
            var layout = {
              margin: {
                b: 23,
                l: 23,
                r: 23,
                t: 10
              },
              xaxis: {
                showgrid: false,

                zeroline: false,
                showline: false,

              },
              yaxis: {
                showgrid: false,

              }
            };

            Plotly.newPlot('myDiv', data, layout, { displayModeBar: false });
            //temperature graph

          });

      });

    if (this.flag == 0) {
      this.flag = 1;
    }
  }


  titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
  }

  // getPlantages() {
  //   this.mapServire.getMyPlantages(this.currentUser.Id)
  //         .subscribe(plantages => {
  //           alert(plantages[0].Name);
  //         });
  // }
}

