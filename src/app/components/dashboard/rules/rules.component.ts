import { Component, OnInit, trigger, transition, style, animate } from '@angular/core';
import { MapService } from '../../../services/map.service';
import { WeatherComponent } from '../weather/weather.component';
import { ModalModule } from "ng2-modal";
import { AuthService } from '../../../services/auth.service';
import { SelectModule } from 'ng2-select';
import { MyDatePickerModule, IMyOptions, IMyDateModel } from 'mydatepicker';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import swal from 'sweetalert2';
import { Cookie } from 'ng2-cookies';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  private rules = [];
  private newRule: any;
  private user: any;
  private owners = [];
  private plantages = [];
  private addedConditions = [];

  private plantageValue = [];
  private ownerValue: any;
  private measurer: any;
  private period: any;
  private value: any;
  private ruleMessage: any;
  private ruleValue: any;


  constructor(
    private toastyService: ToastyService, private toastyConfig: ToastyConfig, private authService: AuthService,
    private translateService: TranslateService
  ) {
    this.plantages = [];
    this.user = JSON.parse(localStorage.getItem('user'));
    this.authService.getAdvancedRules(this.user.Id).subscribe(rules => {
      var pr = JSON.parse(rules.rules);
      for (var i = 0; i < pr.length; i++) {
        this.rules.push(JSON.parse(pr[i].JsonRule));
      }
      this.authService.getPlantageOwners(this.user.Id).subscribe(owners => {
        this.owners = owners.owners;
        //console.log(this.owners);
        // this.authService.getPlantages
      });
    });
  }

  ngOnInit() {
  }

  getPlantagesForOwner(ownerId) {
    this.authService.getPlantagesForOwner(ownerId, this.user.Id).subscribe(plantages => {
      // console.log(plantages.plantages);
      this.plantages = plantages.plantages;
    });
  }

  selectedOwner(value: any): void {
    //console.log(value);
    this.getPlantagesForOwner(value.id);
    this.ownerValue = value;
  }
  typedOwner(value: any): void {

  }
  removedOwner(value: any): void {

  }

  selectedPlantage(value: any): void {
    this.plantageValue.push(value);
  }
  typedPlantage(value: any): void {

  }
  removedPlantage(value: any): void {

  }

  addNewCondition() {
    this.addedConditions.push({
      measurer: this.measurer,
      value: this.value,
      period: this.period,
      ruleValue: this.ruleValue
    });
    this.measurer = null;
    this.value = null;
    this.period = null;
    this.ruleValue = null;
  }

  save() {
    var pravilo = {
      owner: this.ownerValue,
      plantages: this.plantageValue,
      message: this.ruleMessage,
      conditions: this.addedConditions
    }

    this.authService.addAdvancedRule(this.user.Id, pravilo).subscribe(data => {
      this.rules.push(pravilo);
      this.ruleMessage = null;
      this.period = null;
      this.value = null;
      this.ruleValue = null;
      this.addedConditions = [];
    });
  }

  deleteRule(ind) {
    this.authService.deleteAdvancedRule(this.rules[ind]).subscribe(data => {
      this.rules.splice(ind, 1);
    });
  }

  getMeasuringUnit(measurer) {
    var unit = "";
    switch (measurer) {
      case 'Vlažnost vazduha':
        unit = "%";
        break;
      case 'Poljski vodni kapacitet':
        unit = "%";
        break;
      case 'Ph vrednost':
        unit = "pH";
        break;
      case 'Kalcijum-karbonat(CaCO3)':
        unit = "%";
        break;
      case 'Azot(N)':
        unit = "mg/100g";
        break;
      case 'Kalijum(K2O)':
        unit = "mg/100g";
        break;
      case 'Fosfor(P2O5)':
        unit = "mg/100g";
        break;
      case 'Humus':
        unit = "%";
        break;
      case 'Temperatura zemlje':
        unit = "C";
        break;
      case 'Temperatura vazduha':
        unit = "C";
        break;
      case 'Mogucnost padavina':
        unit = "%";
        break;

      default:
        unit = "";
    }
    return unit;
  }

  onClose() {

  }
}
