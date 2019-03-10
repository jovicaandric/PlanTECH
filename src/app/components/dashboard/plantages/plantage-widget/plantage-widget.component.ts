import { Component, OnInit } from '@angular/core';
import { MapService } from '../../../../services/map.service';
import { WeatherComponent } from '../../weather/weather.component';
import '../../map/map-widget/map.widget.engine.js';

declare function zoomPlantageOnWidget(plant): any;

@Component({
  selector: 'app-plantage-widget',
  templateUrl: './plantage-widget.component.html',
  styleUrls: ['./plantage-widget.component.css']
})
export class PlantageWidgetComponent implements OnInit {
  public plantages: any = [];
  public filterQuery = "";
  public rowsOnPage = 10;
  constructor(private mapService: MapService) {
    this.mapService.getPlantages().subscribe(plantages => {
      this.plantages = plantages.plantages;
    })
  }
  dateToString(date) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(date);
    return t.getDate() + "-" + (t.getMonth() + 1) + "-" + t.getFullYear();
  }

  zoomOnPlantage(plant) {
    zoomPlantageOnWidget(plant);
  }
  ngOnInit() {

  }

}
