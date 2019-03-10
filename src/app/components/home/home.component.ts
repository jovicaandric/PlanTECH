import { Component, OnInit } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { PageScrollConfig } from 'ng2-page-scroll';
import { NgsRevealModule } from 'ng-scrollreveal';
declare var require: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private translateService: TranslateService) { }

  ngOnInit() {
  }

  private mockDash = require("./images/mockDash.png");
  private mockPlantage = require("./images/mockPlantage.png");
  private mockWeather = require("./images/mockWeather.png");
  private mockPlant = require("./images/mockPlant.png");

  currentLang = 'SRB';

  changeLang(lang: string) {
    this.translateService.use(lang);
    if (lang === 'srb')
      this.currentLang = 'SRB';
    if (lang === 'en')
      this.currentLang = 'EN';
  }


}
