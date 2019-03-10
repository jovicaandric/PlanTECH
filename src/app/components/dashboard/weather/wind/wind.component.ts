import { Component, OnInit } from '@angular/core';
import { WeatherService } from "../../../../services/weather.service";
import { Router } from '@angular/router';
declare var require: any;

@Component({
  selector: 'app-wind',
  templateUrl: './wind.component.html',
  styleUrls: ['./wind.component.css']
})
export class WindComponent implements OnInit {

  private longitude: string;
  private latitude: string;
  private wind: any[] = [];
  

  constructor(private weatherService: WeatherService, private router: Router) { }
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
  ngOnInit() {
    this.init();
  }
  getData() {
    var data = this.weatherService.getWeatherFromServer(this.latitude, this.longitude).
      subscribe(res => {
        
        for (var i = 1; i < 24; i+=3) {
          var imageArrow;
          var bearing = res[i].windBearing;
          if (bearing > 67.5 && bearing <= 112.5)
            imageArrow = require("./wind/left.png");
          else if (bearing > 112.5 && bearing <= 157.5)
            imageArrow = require("./wind/left-top.png");
          else if (bearing > 157.5 && bearing <= 202.5)
            imageArrow = require("./wind/top.png");
          else if (bearing > 202.5 && bearing <= 247.5)
            imageArrow = require("./wind/right-top.png");
          else if (bearing > 247.5 && bearing <= 292.5)
            imageArrow = require("./wind/right.png"); 
          else if (bearing > 292.5 && bearing <= 337.5)
            imageArrow = require("./wind/right-bottom.png");
          else if ((bearing > 337.5 && bearing <= 360) || (bearing >= 0 && bearing <= 22.5))
            imageArrow = require("./wind/bottom.png");
          else if (bearing > 22.5 && bearing <= 67.5)
            imageArrow = require("./wind/letf-bottom.png");

          this.wind.push({
            "time": new Date(+res[i].time * 1000).getHours() + ":00 h",
            "speed": Math.round(res[i].windSpeed*3.6) + " km/h",
            "direction": res[i].windBearing,
            "image": imageArrow
          })
        }
      });
  }

}
