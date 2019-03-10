import { Component, OnInit } from '@angular/core';
import './map.widget.engine.js';
import { Router } from '@angular/router';
import { MapService } from '../../../../services/map.service';


declare function initWidget(plantages, alerts): any;

@Component({
  selector: 'app-map-widget',
  templateUrl: './map-widget.component.html',
  styleUrls: ['./map-widget.component.css']
})
export class MapWidgetComponent implements OnInit {
  private plantages: any;

  constructor(private router: Router, private mapService: MapService) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);

    this.mapService.getPlantages().subscribe(plantages => {
      this.plantages = plantages.plantages;
      console.log(this.plantages);
      var alerts = [];
      if (this.plantages.length == 0) {
        initWidget(null, null);
      } else {
        for (var i = 0; i < this.plantages.length; i++) {
          this.mapService.checkAlerts(this.plantages[i]).subscribe(alert => {
            alerts.push(alert);
            if (alerts.length == this.plantages.length)
              initWidget(this.plantages, alerts);
          });

        }
      }
    });

  }



  ngOnInit() {
  }

}
