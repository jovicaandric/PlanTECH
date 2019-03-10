import { Component, OnInit, trigger, transition, style, animate, state } from '@angular/core';
import { NgsRevealModule } from 'ng-scrollreveal';
declare var require: any;

@Component({
  selector: 'app-introduction',
  animations: [
  trigger('enterAnimation', [
    state('in', style({opacity: 1, transform: 'translateX(0)'})),
    transition('void => *', [
      style({
        opacity: 0,
        transform: 'translateX(-100%)'
      }),
      animate('1.2s ease-in')
    ])
    
  ])
],
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css']
})
export class IntroductionComponent implements OnInit {

  private map1;
  private map2;
  private map3;
  private showP;
  private editP;
  private addP;
  private options;
  private tabs;
  private weather;
  private planer;
  private calendar;
  private measure;
  private newE;
  private findWorkers;
  private req;
  private measurer;
  private plants;
  private infoPlant;
  private notifi;
  private stat;
  private upgrade;
  private m1;
  private m2;
  private pOnMap;
  private profile;
  private control;
  private workReq;
  private myEmp;
  private owners;
  private merni;
  private plantRule;
  private profill;
  private rule;

  constructor() { }

  ngOnInit() {
    this.showP = require('./images/prikazP.png');
    this.map1 = require('./images/sve.png');
    this.map2 = require('./images/map2.png');
    this.map3 = require('./images/map3.png');
    this.editP = require('./images/izmena.png');
    this.addP = require('./images/dodaj.png');
    this.options = require("./images/opcije.png");
    this.tabs = require('./images/tabovi.png');
    this.weather = require('./images/prognoza.png');
    this.planer = require('./images/planer.png');
    this.calendar = require('./images/kalendar.png');
    this.measure = require('./images/merenja.png');
    this.newE = require('./images/nov.png');
    this.findWorkers = require('./images/pronadjiR.png');
    this.req = require('./images/zahtev.png');
    this.measurer = require('./images/merac.png');
    this.plants = require('./images/biljke.png');
    this.infoPlant = require('./images/biljkaSve.png');
    this.notifi = require('./images/notif.png');
    this.stat = require('./images/stat.png');
    this.upgrade = require('./images/upgrade.png');
    this.m1 = require('./images/m1.png');
    this.m2 = require('./images/m2.png');
    this.pOnMap = require('./images/namapi.png');
    this.profile = require('./images/nalog.png');
    this.control = require('./images/control.png');
    this.workReq = require('./images/zahteviPosao.png');
    this.myEmp = require('./images/mojiZ.png');
    this.owners = require('./images/vlasnik.png');
    this.merni = require('./images/merenjaSve.png');
    this.plantRule = require('./images/biljkePravilo.png');
    this.profill = require('./images/profill.png');
    this.rule = require('./images/rules.png');
  }

}
