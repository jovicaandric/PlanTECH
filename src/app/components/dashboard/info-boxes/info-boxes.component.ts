import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'app-info-boxes',
  templateUrl: './info-boxes.component.html',
  styleUrls: ['./info-boxes.component.css']
})
export class InfoBoxesComponent implements OnInit {

  private plantages: any;
  private countFertilize = 0;
  private countWatering = 0;
  private countHarvest = 0;

  constructor(private router: Router, private mapService: MapService) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);

    this.mapService.getPlantages().subscribe(plantages => {
      this.plantages = plantages.plantages;
      var alerts = [];
      for (var i = 0; i < this.plantages.length; i++) {
        this.mapService.checkAlerts(this.plantages[i]).subscribe(alert => {
          alerts.push(alert);
          if (alerts.length == this.plantages.length) {
            for (var j = 0; j < alerts.length; j++) {
              if (alerts[j].rows.length != 0) {
                if (alerts[j].rows[0].Type == "fertilize")
                  this.countFertilize++;
                else if (alerts[j].rows[0].Type == "watering")
                  this.countWatering++;
                else if (alerts[j].rows[0].Type == "harvest")
                  this.countHarvest++;
              }
            }
          }
        });

      }
    });

  }

  ngOnInit() {
  }

}
