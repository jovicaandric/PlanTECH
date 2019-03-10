import { Component, OnInit, trigger, transition, style, animate } from '@angular/core';
import { MapService } from '../../../services/map.service';
import { WeatherComponent } from '../weather/weather.component';
import { ModalModule } from "ng2-modal";
//import { SwiperModule } from 'angular2-useful-swiper';
import { AuthService } from '../../../services/auth.service';
import './add.plantage.map.js';
import { SelectModule } from 'ng2-select';
import { MyDatePickerModule, IMyOptions, IMyDateModel } from 'mydatepicker';
import { NguiMapModule } from '@ngui/map';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import swal from 'sweetalert2';
import { Cookie } from 'ng2-cookies';
import { TranslateService } from 'ng2-translate';
declare let Plotly: any;
declare function initFromPlantages(): any;
declare function initFromPlantagesForEdit(plant): any;
declare var plantageNew: any;
declare var plantageElevation: any;
declare function newPlantagefromPlantages(plants): any;
declare function updatePlantageFromPlantages(plant): any;
declare var Please: any;
declare var require: any;


// declare function getZoomLevelForPlantage(planta): any;
declare function getCenterForPlantage(planta): any;

@Component({
  selector: 'app-plantages',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ height: 0, opacity: 0, }),
          animate('500ms', style({ height: "*", opacity: 1 }))
        ]),
        transition(':leave', [
          style({ height: "*", opacity: 1 }),
          animate('500ms', style({ height: 0, opacity: 0 }))
        ])
      ]
    ),
    trigger(
      'slideIn', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('500ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          style({ height: "*", opacity: 1 }),
          animate('500ms', style({ height: 0, opacity: 0 }))
        ])
      ]
    )
  ],
  templateUrl: './plantages.component.html',
  styleUrls: ['./plantages.component.css']
})
export class PlantagesComponent implements OnInit {

  private mapView = false;

  public categories: any = [];
  public plants: any = [];
  public species: any = [];
  public seeds: any = [];
  public addedPlants: any = [];

  public plantDate: number;

  private categoryValue: any = {};
  private plantValue: any = {};
  private specieValue: any = {};
  private seedValue: any = {};

  private hiddenPlant: boolean = true;
  private hiddenSpecie: boolean = true;
  private hiddenSeed: boolean = true;
  private hiddenDate: boolean = true;
  private hiddenNew: boolean = true;

  private activePlant: any = null;

  private edit = false;
  private mapaEdit = true;
  private addPlantageTitle: string;

  private mapa = true;
  public plantages: any[] = [];
  public maxPlantages: any;
  public filterQuery = "";
  public rowsOnPage = 10;

  private plantWarning = null;
  private altitudeWarning = null;
  private noMeasurements = true;
  private currentAltitude = null;

  public measurements: any[] = [];

  private addedPlantagePath = plantageNew;

  private title: any;
  private user: any;
  private isOwner: any;
  //private alerts = [];

  private watering = require("../../../../assets/dist/img/icons/watering-can.png");
  private fertilize = require("../../../../assets/dist/img/icons/fertilizer.png");
  private harvest = require("../../../../assets/dist/img/icons/harvest-1.png");
  private rain = require("../../../../assets/dist/img/icons/rain.png");

  constructor(private mapService: MapService,
    private toastyService: ToastyService, private toastyConfig: ToastyConfig, private authService: AuthService,
    private translateService: TranslateService
  ) {
    this.user = JSON.parse(localStorage.getItem('user'));

    this.mapService.getPlantages().subscribe(plantages => {
      this.plantages = plantages.plantages;
      for (var i = 0; i < this.plantages.length; i++) {
        this.mapService.checkAlerts(this.plantages[i]).subscribe(alerts => {
          //this.alerts = alerts;
          for (var j = 0; j < this.plantages.length; j++) {
            if (alerts.rows.length > 0 && alerts.rows[0].PlantageId == this.plantages[j].plantageId) {
              this.plantages[j].alerts = alerts;
              break;
            }
          }
        });
      }
      // console.log;
    });

    this.getCategories();
    this.checkIfOwner();
    this.getMaxPlantages();
    this.toastyConfig.theme = 'default';
    this.toastyConfig.position = "bottom-right";
    // console.log(this.fertilize);
  }
  openAlert(ind) {
    var html = "";
    for (var i = 0; i < this.plantages[ind].alerts.rows.length; i++) {
      var alert = this.plantages[ind].alerts.rows[i];
      var image = "";

      switch (alert.Type) {
        case "fertilize": image = "fertilizer.png"
          break;
        case "watering": image = "watering-can.png";
          break;
        case "harvest": image = "harvest-1.png";
          break;
        case "rule": image = "rule.png";
          break;
      }

      html += "<div style= 'margin:0;margin-bottom:10px;padding:10px; -webkit-box-shadow: 0px 0px 5px 1px #e6e6e6; -moz-box-shadow: 0px 0px 5px 1px #e6e6e6;box-shadow: 0px 0px 5px 1px #e6e6e6;'>";
      html += " <img src='../../../../assets/dist/img/icons/" + image + "' class='img-circle' style='width:50px;height:50px' >&nbsp\
                <h4 style='display:inline;'>" + alert.Title + "</h4>\
                <p style='text-align:justify;font-size:12pt'>"+ alert.Description + "</p>\
              </div>";
    }
    swal({
      title: 'Upozorenja za plantazu',
      type: 'warning',
      html: html,
      showCloseButton: false,
      showCancelButton: false
    })
  }

  ngOnInit() {
  }
  checkIfOwner() {
    this.authService.checkIfOwner(this.user.Id).subscribe(data => {
      this.isOwner = data;
    });
  }
  hasPermission(plant, permId) {
    return plant.permissions.indexOf(permId) > -1;
  }

  animationDone() {
    document.getElementById("prikaz").style.position = "relative";
  }
  animationStart() {
    var mapaDOM = document.getElementById("prikaz");
    if (mapaDOM != null)
      mapaDOM.style.position = "absolute";
  }

  getMaxPlantages() {
    this.authService.getUserProgress(this.user).subscribe(data => {
      let temp = JSON.parse(data.progress);
      temp.forEach(element => {
        this.maxPlantages = element["max"]
      });
    });
  }

  showEdit() {
    this.edit = true;
  }
  hideEdit() {
    this.edit = false;
  }

  showMap() {
    initFromPlantages();
  }
  showMapForEdit(plant) {
    initFromPlantagesForEdit(plant);
    this.addedPlants = plant.plants;
  }
  next() {
    this.mapa = false;
    this.currentAltitude = plantageElevation;
  }
  save() {
    if (!this.hiddenNew) {
      this.addedPlants.push({
        category: {
          id: this.categoryValue.id,
          text: this.categoryValue.text
        },
        plant: {
          id: this.plantValue.id,
          text: this.plantValue.text
        },
        specie: {
          id: this.specieValue.id,
          text: this.specieValue.text
        },
        seedManufacturer: {
          id: this.seedValue.id,
          text: this.seedValue.text
        },
        plantDate: this.plantDate
      });
    }
    newPlantagefromPlantages(this.addedPlants);
    this.toastyService.success({
      title: "Plantage added",
      msg: "You have successfully added a new plantage.",
      showClose: true,
      timeout: 5000,
      theme: "default"
    });
    this.plantages.push({
      title: this.addPlantageTitle,
      owner: {
        id: this.user.Id,
        firstname: this.user.Firstname,
        lastname: this.user.Lastname
      },
      path: plantageNew,
      plants: this.addedPlants,
      permissionsName: ["Read measurements", "Read weather data", "Get notifications", "Change plantage details", "Change rules"],
      permissions: ["1", "2", "3", "4", "5"]
    });
    this.addPlantageTitle = "";
    this.addedPlants = [];
    this.plantWarning = null;
    this.altitudeWarning = null;
  }
  updatePlantage(plant) {
    if (!this.hiddenNew) {
      this.addedPlants.push({
        category: {
          id: this.categoryValue.id,
          text: this.categoryValue.text
        },
        plant: {
          id: this.plantValue.id,
          text: this.plantValue.text
        },
        specie: {
          id: this.specieValue.id,
          text: this.specieValue.text
        },
        seedManufacturer: {
          id: this.seedValue.id,
          text: this.seedValue.text
        },
        plantDate: this.plantDate
      });
    }
    plant.plants = this.addedPlants;

    for (var i = 0; i < this.plantages.length; i++) {
      if (plant.plantageId == this.plantages[i].plantageId) {
        this.plantages[i] = plant;
        this.plantages[i].title;
        break;
      }
    }

    updatePlantageFromPlantages(plant);
    this.toastyService.success({
      title: "Plantaža je dodata",
      msg: "Uspešno ste dodali novu plantažu.",
      showClose: true,
      timeout: 5000,
      theme: "default"
    });
    this.plantWarning = null;
    this.altitudeWarning = null;
  }

  onClose() {
    this.mapa = true;
    this.addedPlants = [];
    this.categoryValue = null;
    this.plantValue = null;
    this.specieValue = null;
    this.plantDate = null;
    this.altitudeWarning = null;
    this.plantWarning = null;
    this.hiddenPlant = true;
    this.hiddenSpecie = true;
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;
  }
  //za kategoriju  
  public selectedCategory(value: any): void {
    this.hiddenPlant = true;
    this.hiddenSpecie = true;
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenPlant = true;
    this.hiddenNew = true;
    this.getPlants(value.id);
    this.categoryValue = value;
    this.hiddenPlant = false;

  }

  public removedCategory(value: any): void {
    this.hiddenPlant = true;
    this.hiddenSpecie = true;
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;
    this.plantWarning = null;
  }

  public typedCategory(value: any): void {
  }

  //za biljku  
  public selectedPlant(value: any): void {
    this.hiddenSpecie = true;
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;


    this.getSpecies(value.id);
    this.plantValue = value;
    this.hiddenSpecie = false;
    var pl = this.findSelectedPlant(value.id);
    if (this.currentAltitude != null && (this.currentAltitude < pl.AltitudeFrom || this.currentAltitude > pl.AltitudeTo)) {
      this.altitudeWarning = "Odabranu biljku nije pogodno saditi na nadmorskoj visini od " + this.currentAltitude.toFixed(2) + " m. Optimalna nadmorska visina za " + value.text + " je:" + pl.AltitudeFrom + "-" + pl.AltitudeTo + " m.";
    } else {
      this.altitudeWarning = null;
    }
  }
  findSelectedPlant(plantId) {
    for (var i = 0; i < this.plants.length; i++) {
      if (this.plants[i].id == plantId) {
        return this.plants[i];
      }
    }
  }

  monthToString(month) {
    var m = month % 12;
    var mo;
    switch (m) {
      case 0:
        mo = "Decembar";
        break;
      case 1:
        mo = "Januar";
        break;
      case 2:
        mo = "Februar";
        break;
      case 3:
        mo = "Mart";
        break;
      case 4:
        mo = "April";
        break;
      case 5:
        mo = "Maj";
        break;
      case 6:
        mo = "Jun";
        break;
      case 7:
        mo = "Jul";
        break;
      case 8:
        mo = "Avgust";
        break;
      case 9:
        mo = "Septembar";
        break;
      case 10:
        mo = "Oktobar";
        break;
      case 11:
        mo = "Novembar";
        break;

    }
    //console.log(m, month, mo);
    return mo;
  }

  checkPlant() {
    var currentMonth = new Date(this.plantDate * 1000).getMonth() + 1;
    var plant = this.findSelectedPlant(this.plantValue.id);
    if (plant.PlantingTo && plant.PlantingFrom) {
      if (plant.PlantingTo < plant.PlantingFrom) {
        plant.PlantingTo = 12 + plant.PlantingTo;
        currentMonth = 12 + currentMonth;
      }
      if (currentMonth > plant.PlantingTo || currentMonth < plant.PlantingFrom) {
        this.plantWarning = "Odabrani datum sadnje nije pogodan za željenu biljku. Optimalan period za " + plant.text + " je: " + this.monthToString(plant.PlantingFrom) + "-" + this.monthToString(plant.PlantingTo);
      } else {
        this.plantWarning = null;
      }
    }
  }

  public removedPlant(value: any): void {
    this.hiddenSpecie = true;
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;
    this.plantWarning = null;
    this.altitudeWarning = null;
  }

  public typedPlant(value: any): void {
  }

  //za sortu  
  public selectedSpecie(value: any): void {
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;
    this.getSeedManufacturers(value.id);
    this.specieValue = value;
    this.hiddenSeed = false;
  }

  public removedSpecie(value: any): void {
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;
    this.plantWarning = null;
    this.altitudeWarning = null;
  }

  public typedSpecie(value: any): void {
  }

  //za proizvodjaca semena
  public selectedSeed(value: any): void {
    this.hiddenDate = true;
    this.hiddenNew = true;
    this.seedValue = value;
    this.hiddenDate = false;
  }

  public removedSeed(value: any): void {
    this.hiddenDate = true;
    this.hiddenNew = true;
    this.plantWarning = null;
    this.altitudeWarning = null;
  }

  public typedSeed(value: any): void {
  }

  onDateChanged(event: IMyDateModel) {
    this.plantDate = event.epoc;
    if (event.epoc == 0) {
      this.hiddenNew = true;
      this.plantDate = null;
      this.plantWarning = null;
    } else {
      this.hiddenNew = false;
      this.plantDate = event.epoc;
      this.checkPlant();
    }
  }

  addAnotherPlant() {
    this.addedPlants.push({
      category: {
        id: this.categoryValue.id,
        text: this.categoryValue.text
      },
      plant: {
        id: this.plantValue.id,
        text: this.plantValue.text
      },
      specie: {
        id: this.specieValue.id,
        text: this.specieValue.text
      },
      seedManufacturer: {
        id: this.seedValue.id,
        text: this.seedValue.text
      },
      plantDate: this.plantDate
    });
    this.hiddenDate = true;
    this.hiddenSeed = true;
    this.hiddenSpecie = true;
    this.hiddenPlant = true;
    this.hiddenNew = true;
    this.altitudeWarning = null;
    this.plantWarning = null;
  }

  deletePlantage(plant) {
    swal({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonClass: 'btn btn-primary',
      cancelButtonClass: 'btn btn-danger'
    }).then(() => {
      this.mapService.deletePlantage(plant.plantageId).subscribe();
      this.removePlantage(plant);
      this.toastyService.success({
        title: "Plantage deleted",
        msg: "You have successfully deleted this plantage.",
        showClose: true,
        timeout: 5000,
        theme: "default"
      });
    }, function (dismiss) {
    });
  }
  dateToString(date) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(date);
    return t.getDate() + "-" + (t.getMonth() + 1) + "-" + t.getFullYear();
  }

  removePlantage(plant) {
    for (var i = 0; i < this.plantages.length; i++) {
      if (this.plantages[i].plantageId == plant.plantageId) {
        this.plantages.splice(i, 1);
        break;
      }
    }
  }

  removeAddedPlant(rbr: number) {
    this.addedPlants.splice(rbr, 1);
  }
  removeAddedPlantEdit(plantageRbr: number, plantRbr: number) {
    this.plantages[plantageRbr].plants.splice(plantRbr, 1);
  }

  getCategories() {
    this.mapService.getPlantCategories().subscribe(categories => {
      this.categories = JSON.parse(categories.categories);
    });
  }
  getPlants(categoryID: any) {
    this.mapService.getPlants(categoryID, this.user.Id).subscribe(plants => {
      this.plants = JSON.parse(plants.plants);
    });
  }
  getSpecies(plantID: any) {
    this.mapService.getSpecies(plantID, this.user.Id).subscribe(species => {
      this.species = JSON.parse(species.species);
    });
  }
  getSeedManufacturers(specieID: any) {
    this.mapService.getSeedmanufacturer(specieID).subscribe(seeds => {
      this.seeds = JSON.parse(seeds.seeds);
    });
  }

  // getZoomLevel(plant) {
  //   getZoomLevelForPlantage(plant);
  // }

  getCenter(plant) {
    var center = getCenterForPlantage(plant);
    return center.lat() + ", " + center.lng();
  }

  getMeasurementsForPlantage(plantageId) {
    this.noMeasurements = true;
    this.mapService.getMeasurementsForPlantage(plantageId).subscribe(measurements => {
      this.measurements = measurements.measurements;

      if (this.measurements.length > 0) {
        var day1;
        var day3;
        var month1;
        var year1;
        var all;

        if (this.translateService.currentLang == "srb") {
          day1 = "1 dan";
          day3 = "3 dana";
          month1 = "Mesec dana";
          year1 = "Godina";
          all = "Sve";
        }
        else {
          day1 = "1 day";
          day3 = "3 days";
          month1 = "Month";
          year1 = "Year";
          all = "All";
        }

        var data = [];
        var colors = [];
        colors.push("#6699cc");
        colors.push("#ffbf80");
        colors.push("#a6a6a6");
        colors.push("#79d2a6");//
        colors.push("#cc6666");
        colors.push("#a3a3c2");
        colors.push("#b8b894");
        colors.push("#99e699");
        colors.push("#bf80ff");
        colors.push("#ffff99");
        colors.push("#b3d9ff");
        colors.push("#e0b3ff");
        colors.push("#df9fbf");
        colors.push("#ffccb3");
        colors.push("#d9b38c");
        colors.push("#9fdfbe");
        colors.push("#e6b3cc");
        colors.push("#009999");
        colors.push("#993333");
        colors.push("#666699");
        colors.push("#6699cc");
        colors.push("#ffbf80");
        colors.push("#a6a6a6");
        colors.push("#79d2a6");//
        colors.push("#cc6666");
        colors.push("#a3a3c2");
        colors.push("#b8b894");
        colors.push("#99e699");
        colors.push("#bf80ff");
        colors.push("#ffff99");
        colors.push("#b3d9ff");
        colors.push("#e0b3ff");
        colors.push("#df9fbf");
        colors.push("#ffccb3");
        colors.push("#d9b38c");
        colors.push("#9fdfbe");
        colors.push("#e6b3cc");
        colors.push("#009999");
        colors.push("#993333");
        colors.push("#666699");


        for (var i = 0; i < this.measurements.length; i++) {
          var x = [];
          var y = [];
          for (var j = 0; j < this.measurements[i].Measurements.length; j++) {
            var t = new Date(this.measurements[i].Measurements[j].DateTime); // Epoch
            x.push(t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate() + " " + t.getHours());
            y.push(Math.round(this.measurements[i].Measurements[j].Value * 10) / 10);
          }
          if (x.length && y.length)
            this.noMeasurements = false;

          var trace = {
            type: 'scatter',
            x: x,
            x0: x[0],
            dx: 10,
            fill: 'tozeroy',
            y: y,
            mode: 'lines',
            height: 700,
            name: this.measurements[i].MeasuringUnit,
            line: {
              // color: '#' + Math.floor(Math.random() * 16777215).toString(16),
              color: colors[i],
              width: 2
            }
          }
          data.push(trace);
        }
        var selectorOptions = {
          buttons: [{
            step: 'day',
            stepmode: 'todate',
            count: 1,
            label: day1
          }, {
            step: 'day',
            stepmode: 'backward',
            count: 3,
            label: day3
          }, {
            step: 'month',
            stepmode: 'backward',
            count: 1,
            label: month1
          }, {
            step: 'year',
            stepmode: 'backward',
            count: 1,
            label: year1
          }, {
            step: 'all',
            label: all
          }],
        };
        var today = new Date();
        var max = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " " + today.getHours();
        var min = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + (today.getDate() - 5) + " " + today.getHours()
        var layout = {
          showlegend: true,
          title: 'Merenja',
          xaxis: {
            range: [min, max],
            rangeselector: selectorOptions,
            rangeslider: {}
          },
          yaxis: {
            fixedrange: true
          }
        };
        setTimeout(function () {
          Plotly.newPlot('myDiv', data, layout);
        }, 100);

      }
    });

  }

  // getAlertsForPlantage(plantage) {
  //   this.mapService.checkAlerts(plantage).subscribe(alerts => {
  //     this.alerts = alerts;
  //   });
  // }


}
