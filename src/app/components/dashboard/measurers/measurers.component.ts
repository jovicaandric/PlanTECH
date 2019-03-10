import { Component, OnInit } from '@angular/core';
import { MapService } from '../../../services/map.service';
import './measurers.engine.js';
import { Router } from '@angular/router';

declare function initMeasurers(measurers, plantages): any;
declare function addNewMeasurer(addedMeasurer): any;

@Component({
  selector: 'app-measurers',
  templateUrl: './measurers.component.html',
  styleUrls: ['./measurers.component.css']
})
export class MeasurersComponent implements OnInit {
  private measurerUrl: any;
  private measureValue: any;
  private checkedPlantages: any;
  private plantages: any;
  private user: any;
  private measurers: any;

  constructor(private router: Router, private mapService: MapService) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);

    this.user = JSON.parse(localStorage.getItem('user'));

    this.mapService.getPlantages().subscribe(plantages => {
      this.plantages = plantages.plantages;
      this.checkedPlantages = new Array(plantages.length);
      this.mapService.getMeasurers(this.user).subscribe(measurers => {
        this.measurers = JSON.parse(measurers.measurers);
        console.log(this.measurers);
        initMeasurers(measurers, this.plantages);
      });
    });
  }

  saveMeasurer() {
    let addedMeasurer: any = {};
    addedMeasurer.url = this.measurerUrl;
    addedMeasurer.measureValue = this.measureValue;
    addedMeasurer.checkedPlantages = [];
    for (var i = 0; i < this.checkedPlantages.length; i++)
      if (this.checkedPlantages[i] == true)
        addedMeasurer.checkedPlantages.push(this.plantages[i].plantageId);
    addedMeasurer.owner = JSON.parse(localStorage.getItem("user")).Id;
    addNewMeasurer(addedMeasurer);
  }

  checkPlantage(plant: number, meas: any) {
    for (var i = 0; i < meas.Plantages.length; i++) {
      if (this.plantages[plant].plantageId == meas.Plantages[i].id)
        return true;
    }
    return false;
  }

  checkChanged(rbr, meas, $event) {
    if ($event == true) {
      meas.Plantages.push({
        id: this.plantages[rbr].plantageId,
        name: this.plantages[rbr].title
      });
    } else {
      for (var i = 0; i < meas.Plantages.length; i++) {
        if (this.plantages[rbr].plantageId == meas.Plantages[i].id)
          meas.Plantages.splice(i, 1);
      }
    }
  }

  saveEditedMeasurer(meas) {
    this.mapService.editMeasurer(meas, this.plantages).subscribe(data => {
      // initMeasurers(this.measurers);
    });
  }
  cancelEdit() {
    // this.mapService.getMeasurers(this.user).subscribe(measurers => {
    //   this.measurers = JSON.parse(measurers.measurers);
    // });
  }
  ngOnInit() {
  }

}
