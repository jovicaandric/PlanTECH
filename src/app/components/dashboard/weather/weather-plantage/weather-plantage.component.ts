import { Component, OnInit, Input } from '@angular/core';
import { WeatherModel } from '../weather.model';
import { WeatherService } from "../../../../services/weather.service";
import { AuthService } from "../../../../services/auth.service";
import { nvD3 } from 'ng2-nvd3';
import { Router } from '@angular/router';
declare let d3, nv: any;
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PrecipProbGraphComponent } from "../precip-prob-graph/precip-prob-graph.component";
import { GoogleChartComponent } from "../google-chart/google-chart.component";
declare var require: any;
import { DayWeather } from "../day.model";
declare let Plotly: any;
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'app-weather-plantage',
  providers: [WeatherService],
  templateUrl: './weather-plantage.component.html',
  styleUrls: ['./weather-plantage.component.css']
})
export class WeatherPlantageComponent implements OnInit {
  @Input() longitude;
  @Input() latitude;
  @Input() plantageId;
  private days: any[] = [];
  private currentTemp;
  private currentTempImage;
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
  private imageWindCurrent;
  private precipImage = require("./images/precip.png");
  geocoder = new google.maps.Geocoder;
  infowindow = new google.maps.InfoWindow;
  hourlyD: any[] = [];
  pastWeather: any[] = [];


  myPosition: any;



  constructor(private weatherService: WeatherService, private router: Router, private authService: AuthService,
  private translateService: TranslateService) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);

  }

  ngOnInit() {
    this.getData();
    this.getForecastPast();
  }

  getForecastPast() {
    this.authService.getForecastPast(this.plantageId).subscribe(data => {
      let values = JSON.parse(data.values);
      for (var i = 0; i < values.length; i++) {
        if (this.plantageId == values[i].PlantageId) {
          this.pastWeather.push(values[i]);
        }
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

          var imageArrow;
          var bearing = daily[i].windBearing;
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


          var day = {
            maxTemp: Math.round(daily[i].temperatureMax),
            minTemp: Math.round(daily[i].temperatureMin),
            day: (this.daysWeek[new Date(+daily[i].time * 1000).getDay()]).substring(0, 3),
            icon: image,
            precip: Math.round(daily[i].precipProbability * 100) + " %",
            windSpeed: Math.round(daily[i].windSpeed * 3.6) + " km/h",
            humidity: Math.round(daily[i].humidity * 100) + "%",
            windImage: imageArrow
          }

          this.days.push(day);
        }

        var dataHourly = this.weatherService.getWeatherFromServer(this.latitude, this.longitude)
          .subscribe(haurly => {
            this.hourlyD = haurly;
            this.currentTemp = Math.round(haurly[0].temperature);
            this.humidity = Math.round(haurly[0].humidity * 100);
            this.summary = haurly[0].summary;
            this.precip = Math.round(haurly[0].precip * 100) + " %";
            this.windSpeed = Math.round(haurly[0].windSpeed * 3.6);

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

            //wind

            for (var i = 1; i <= 12; i++) {
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
              this.imageWindCurrent = this.wind[0].image;
            }
            //wind


            //BAR 
            var x1 = []; var y1 = [];
            var annotationContent = [];
            for (var i = 1; i <= 12; i++) {
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
                l: 40,
                r: 40,
                b: 40,
                t: 40
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
            Plotly.newPlot('myDiv1', data1, layout1, { displayModeBar: false });



            //BAR
            if (document.getElementById("myDiv")) {

            }
          });

      });

  }

  showTemp($event) {
    if ($event == 1) {
      setTimeout(() => {
        var sin = []; var x = []; var y = [];
        for (var i = 0; i < 24; i += 2) {
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
            l: 40,
            r: 40,
            b: 40,
            t: 40
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

    if ($event == 4) {
      setTimeout(() => {
        var sin = []; var x = []; var y = []; var x1 = []; var y1 = []; var y2 = [];
        for (var i = 0; i < this.pastWeather.length; i++) {
          let time: any;
          time = (new Date(+this.pastWeather[i].Date * 1000));

          let tempMax: any;
          let tempMin: any;
          tempMin = Math.round(this.pastWeather[i].MinTemp);
          tempMax = Math.round(this.pastWeather[i].MaxTemp);
          x.push(time);
          y.push(tempMin);
          x1.push(time);
          y1.push(tempMax);
          y2.push(this.pastWeather[i].PrecipProbability);
        }

        var trace1 = {
          x: x,
          y: y,
          yaxis: 'y2',
          name: "Minimalna temperatura",
          type: 'scatter',
          mode: "line",
          line: {
            // color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            color: "#0066cc",
            width: 2
          }
        };
        var trace2 = {
          x: x1,
          y: y1,
          yaxis: 'y2',
          name: "Maksimalna temperatura",
          type: 'scatter',
          mode: "line",
          line: {
            // color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            color: "#b30000",
            width: 2
          }
        };
        var trace3 = {
          x: x1,
          y: y2,
          type: 'bar',
          name: "Intenzitet padavina mm/h",
          marker: {
            color: 'rgb(158,202,225)',
            opacity: 0.6,
            line: {
              color: 'rbg(8,48,107)',
              width: 1.5
            }
          }
        };

        var data = [trace1, trace2, trace3];
        var layout = {
          title: "Klima dijagram",
          bargap : 0.7,
          showlegend: true,
          legend: {
            x: 100,
            y: 7
          },
          margin: {
            l: 40,
            r: 40,
            b: 50,
            t: 40
          },
          xaxis: {
            showgrid: false,

          },
          yaxis: {
            showgrid: false,
            title: "Padavine"

          },
          yaxis2: {
            title: 'Temperatura',
            overlaying: 'y',
            side: 'right'
          }
        };
        var text = ' <p class="text-muted" style="font-size: 14pt">Trenutno ne postoje podaci za ovu plantažu <span></span></p>';
        if (this.translateService.currentLang == "en")
          text =  ' <p class="text-muted" style="font-size: 14pt;margin-left:30%">There is no data for this plantage yet. <span></span></p>';
        if (this.pastWeather.length == 0)
          document.getElementById("myDiv2").innerHTML = '<div  class="message-container" style="margin-top:10%; margin-left:33%">' +
            '<div class="message" >' +
            '<i class="fa  fa-bar-chart" style="font-size: 44pt; color:lightgray; margin-left:22%" ></i>' +
            text +
            '</div>' +
            '</div>';
        else
          Plotly.newPlot('myDiv2', data, layout, { displayModeBar: false });
      }, 100)

    }
  }
}
