import { Component, OnInit } from '@angular/core';
import { WeatherService } from "../../../../services/weather.service";
import { Router } from '@angular/router';
declare var nv: any;
declare var d3: any;

@Component({
  selector: 'app-precip-prob-graph',
  templateUrl: './precip-prob-graph.component.html',
  styleUrls: ['./precip-prob-graph.component.css']
})
export class PrecipProbGraphComponent implements OnInit {

  private longitude;
  private latitude;
  private pressure;
  private cloudCover;
  private visibility;

  constructor(private weatherService: WeatherService, private router: Router) { }

  ngOnInit() {
    this.init();
  }
  init () {
   
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.showPosition.bind(this));
    } else { 
       console.log("Geolocation is not supported by this browser.");}
    }
    
    showPosition(position) {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.getData();
    }

    getData() {
    var values: any[] = [];
    var historicalBarChart = [];
    var obj = {
      key: "u",
      values: []
    }

    var data = this.weatherService.getWeatherFromServer(this.latitude, this.longitude).
      subscribe(res => {
        this.pressure = res[0].pressure + " Mb";
        this.cloudCover = Math.round(res[0].cloudCover * 100) + "%";
        this.visibility = res[0].visibility + " Km";
        
        for (var i = 0; i < 9; i++) {
          var date = new Date(+res[i].time *1000);
          var prec =(res[i].precipProbability * 100);
          var value = {
            "label": date.getDate() + "/ " + date.getMonth() + " " + date.getHours()+":00",
            "value": prec
          }
          obj.values.push(value);
        }
        historicalBarChart.push(obj);
        

        nv.addGraph(function () {
          var chart = nv.models.discreteBarChart()
            .x(function (d) { return d.label })
            .y(function (d) { return d.value  })
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
        });
      });

  }

}