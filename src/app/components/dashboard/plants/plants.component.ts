import { Component, OnInit, trigger, transition, style, animate } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { MapService } from '../../../services/map.service';
import { Router } from '@angular/router';
import { User } from '../../user-management/user.model';
import { ModalModule } from "ng2-modal";
import swal from 'sweetalert2';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { NouisliderModule } from 'ng2-nouislider';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NouiFormatter } from "ng2-nouislider";

export class HumidityFormatter implements NouiFormatter {
  to(value: number): string {
    return "pera %";
  }

  from(value: string): number {
    return parseInt(value);
  }
}

@Component({
  selector: 'app-plants',
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
    )
  ],
  templateUrl: './plants.component.html',
  styleUrls: ['./plants.component.css']
})
export class PlantsComponent implements OnInit {

  private plants: any[];
  private tempPlants: any[];
  private tempPlant: any;
  private user: any;
  private isOwner: any;
  private ct = 0;
  private view: boolean;
  private selectedIndex: number;

  private measurers: any[] =
  [{

  }];

  private categories: any;
  private category: any;
  private plant: any;
  private specie: any;
  private seedManufacturer: any;

  constructor(
    private authService: AuthService,
    private mapService: MapService,
    private router: Router,
    private toastyService: ToastyService, private toastyConfig: ToastyConfig
  ) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);
    else if (JSON.parse(localStorage.getItem('user')).Role != "User")
      this.router.navigate(['/unautorized']);
    this.toastyConfig.theme = 'default';
    this.toastyConfig.position = "bottom-right";
    this.user = JSON.parse(localStorage.getItem('user'));
    this.checkIfOwner();
    this.view = false;
  }

  ngOnInit() {
    this.getPlants();
    this.getCategories();
  }


  changeCt($event) {
    this.ct = $event;
  }

  openRuleForm(index) {
    this.ct = 0;
    if (this.selectedIndex == index && this.view == true)
      this.view = false;
    else {
      this.selectedIndex = index;
      this.view = true;
    }
  }
  getPlants() {
    this.authService.getAllPlants(this.user.Id).subscribe(data => {
      this.plants = JSON.parse(data.plants);
      this.tempPlants = JSON.parse(data.plants);
    });
  }
  checkIfOwner() {
    this.authService.checkIfOwner(this.user.Id).subscribe(data => {
      this.isOwner = data;
    });
  }
  search = '';

  filter() {


    this.authService.getAllPlants(this.user.Id).subscribe(data => {
      let plants: any = JSON.parse(data.plants);
      this.plants = [];
      plants.forEach(plant => {
        var regexp = new RegExp(this.search, "i");

        if (regexp.test(plant['CategoryName']) == true || regexp.test(plant['PlantName']) == true ||
          regexp.test(plant["SpecieName"]) == true || regexp.test(plant["SeedManufacturerName"]) == true || regexp.test(plant["Description"]) == true) {
          this.plants.push(plant);
        }
      });
    });
  }


  cancelRule(i: number) {
    swal({
      title: 'Da li ste sigurni?',
      text: "Odabrane optimalne vrednosti neće biti sačuvane!",
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Poništi',
      cancelButtonText: 'Nastavi',
      confirmButtonClass: 'btn btn-primary',
      cancelButtonClass: 'btn btn-default'
    }).then(() => {
      this.plants[i].Phases = null;
      this.plants[i].Phases = JSON.parse(JSON.stringify(this.tempPlants[i].Phases));
      this.view = false;
    }, function (dismiss) {
    });


  }

  saveRule(item: any) {
    this.authService.addRule(item.Phases, this.user.Id, item.PlantId).subscribe(data => {
      this.toastyService.success({
        title: "Uspešno ste sačuvali vrednosti",
        msg: "Odabrane optimalne vrednosti su uspešno sašuvane",
        showClose: true,
        timeout: 5000,
        theme: "default"
      });
    });
  }
  save() {
    var newplant = {
      category: this.category,
      plant: this.plant,
      specie: this.specie,
      seedManufacturer: this.seedManufacturer,
      owner: this.user.Id
    }
    this.authService.addNewPlant(newplant).subscribe(data => {
      this.category = null;
      this.plant = null;
      this.specie = null;
      this.seedManufacturer = null;
    });
  }
  getCategories() {
    this.mapService.getPlantCategories().subscribe(categories => {
      this.categories = JSON.parse(categories.categories);
    });
  }

  deletePlant(specieId) {
    this.authService.removePlant(specieId).subscribe(data => {
      for (var i = 0; i < this.plants.length; i++) {
        if (this.plants[i].SpecieId == specieId) {
          this.plants.splice(i, 1);
          break;
        }
      }

    });
  }

  airHumidityConfig: any = {
    connect: true,

    step: 5,
    range: {
      min: 0,
      max: 100
    },
    tooltips: new HumidityFormatter(),
    pips: {
      mode: 'steps',
      density: 5
    }
  };
  groundHumidityConfig: any = {
    connect: true,

    step: 5,
    range: {
      min: 60,
      max: 100
    },
    tooltips: new HumidityFormatter(),
    pips: {
      mode: 'steps',
      density: 5
    }
  };
  caco3Config: any = {
    connect: true,

    step: 1,
    range: {
      min: 0,
      max: 10
    },
    pips: {
      mode: 'steps',
      density: 10
    }

  };
  nConfig: any = {
    connect: true,

    step: 0.5,
    range: {
      min: 0,
      max: 5
    }, pips: {
      mode: 'count',
      density: 12,
      values: 6,
      stepped: true
    }

  };
  k2oConfig: any = {
    connect: true,

    step: 1,
    range: {
      min: 0,
      max: 40
    }, pips: {
      mode: 'steps',
      density: 10
    }

  };
  phConfig: any = {
    connect: true,

    step: 0.5,
    range: {
      min: 3,
      max: 9
    },
    pips: {
      mode: 'count',
      density: 14,
      values: 7,
      stepped: true
    }

  };
  groundTemp: any = {
    connect: true,
    step: 5,
    range: {
      min: 0,
      max: 70,

    }, pips: {
      mode: 'steps',
      density: 5
    }
  };

  addAltitudeRule(item) {
    item.Phases[this.ct].Rules.Altitude[0] = 500;
    item.Phases[this.ct].Rules.Altitude[1] = 1000;
  }
  addAirHumidityRule(item) {
    item.Phases[this.ct].Rules.AirHumidity[0] = 30;
    item.Phases[this.ct].Rules.AirHumidity[1] = 70;
  }
  addGroundHumidityRule(item) {
    item.Phases[this.ct].Rules.GroundHumidity[0] = 30;
    item.Phases[this.ct].Rules.GroundHumidity[1] = 70;
  }
  addPhRule(item) {
    item.Phases[this.ct].Rules.PH[0] = 5;
    item.Phases[this.ct].Rules.PH[1] = 7;
  }
  addCaCO3Rule(item) {
    item.Phases[this.ct].Rules.CACO3[0] = 4;
    item.Phases[this.ct].Rules.CACO3[1] = 8;
  }
  addP2O5Rule(item) {
    item.Phases[this.ct].Rules.P2O5[0] = 15;
    item.Phases[this.ct].Rules.P2O5[1] = 30;
  }
  addK2ORule(item) {
    item.Phases[this.ct].Rules.K2O[0] = 15;
    item.Phases[this.ct].Rules.K2O[1] = 30;
  }
  addNRule(item) {
    item.Phases[this.ct].Rules.N[0] = 1;
    item.Phases[this.ct].Rules.N[1] = 4;
  }
  addGroundTempRule(item) {
    item.Phases[this.ct].Rules.GroundTemp[0] = 5;
    item.Phases[this.ct].Rules.GroundTemp[1] = 20;
  }
  addGrowingTimeRule(item) {
    item.Phases[this.ct].Rules.GrowingTime = 200;
  }

}
