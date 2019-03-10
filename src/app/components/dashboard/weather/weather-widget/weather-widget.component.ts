import { Component, OnInit, Input } from '@angular/core';
import { WeatherModel } from '../weather.model';
import { WeatherService } from "../../../../services/weather.service";
import { nvD3 } from 'ng2-nvd3';
import { Router } from '@angular/router';
declare let d3, nv: any;
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PrecipProbGraphComponent } from "../precip-prob-graph/precip-prob-graph.component";
import { TranslateService } from 'ng2-translate';
declare var require: any;
declare let Plotly: any;
import { DayWeather } from "../day.model";

@Component({
  selector: 'app-weather-widget',
  providers: [WeatherService],
  templateUrl: './weather-widget.component.html',
  styleUrls: ['./weather-widget.component.css']
})


export class WeatherWidgetComponent implements OnInit {
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
  hourlyD: any[] = [];
  private currLang;

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
  colorScheme = {
    domain: ['#FFE167']
  };
  autoScale = true;
  myPosition: any;

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

  constructor(private weatherService: WeatherService, private router: Router,
       private translateService: TranslateService) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);
      this.currLang = translateService.currentLang;
      console.log(this.currLang + "  jezik0");
  }

  ngOnInit() {
    this.init();
  }

  codeAddress() {
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
  getData() {
    this.days.length = 0;
    var values: any[] = [];
    var historicalBarChart = [];
    var obj = {
      key: "u",
      values: []
    }
    var city;
    this.locationCurrent = "";
    var latlng = { lat: this.latitude, lng: this.longitude };
    this.geocoder.geocode({ 'location': latlng }, (results, status) => {

      city = ((results[1].formatted_address).split(","))[0];
      this.locationCurrent = city;

    });



    var dataDaily = this.weatherService.getDaily(this.latitude, this.longitude)
      .subscribe(daily => {

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
            this.hourlyD = haurly;
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
            this.precip = Math.round(haurly[0].precipProbability * 100);


            var x1 = []; var y1 = [];
            var annotationContent = [];
            for (var i = 1; i < 24; i+=3) {
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
                r: 23,
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
            //BAR 
            /*  for (var i = 0; i < 5; i++) {
                var date = new Date(+haurly[i].time * 1000);
                var prec = Math.round(haurly[i].precipProbability * 100);
                var value = {
                  "label": date.getDate() + "/ " + date.getMonth() + " " + date.getHours() + ":00",
                  "value": prec
                }
                obj.values.push(value);
              }
              historicalBarChart.push(obj);
  
  
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
                chart.yAxis.axisLabel("Precip (in %)")
                d3.select('#chart1 svg')
                  .datum(historicalBarChart)
                  .call(chart);
                nv.utils.windowResize(chart.update);
                return chart;
              });
  */
            //BAR 
            /*
            var sin = [];
            for (var i = 0; i < 10; i++) {
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
              // console.log("prepP="+haurly[i].precipProbability * 100);
            }

            this.dataGraph =
              [
                {
                  name: "Temperatura °C",      //values - represents the array of {x,y} data points
                  series: sin
                }
              ];
*/
          });

      });

  }
  showTemp($event) {
    if ($event == 1) {
      setTimeout(() => {
        var sin = []; var x = []; var y = [];
        for (var i = 0; i < 24; i += 3) {
          let time: any;
          time = (new Date(+this.hourlyD[i].time * 1000));
          var day = time.getDate();
          var month = time.getMonth();
          var hours = time.getHours();
          var datum = hours + ":00";
          let precip: any;
          let temp: any;
          temp = Math.round(this.hourlyD[i].temperature);
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

          },
          yaxis: {
            showgrid: false,
          }
        };

        Plotly.newPlot('myDiv', data, layout, { displayModeBar: false });
      }, 100)

    }
  }

}

