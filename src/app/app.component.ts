import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { PageScrollConfig } from 'ng2-page-scroll';
import { Router } from '@angular/router';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { NgsRevealConfig } from 'ng-scrollreveal';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  constructor(private translate: TranslateService, private router: Router, private toastyService: ToastyService, private toastyConfig: ToastyConfig,
    config: NgsRevealConfig) {
    translate.addLangs(['en', 'srb']); // primer za dva jezika, može ih biti više
    // Za svaki jezik biće potrebno imati poseban .json fajl kao što će biti objašnjeno posle
    translate.setDefaultLang('srb');
    translate.use('srb');
    this.toastyConfig.theme = 'default';
    this.toastyConfig.position = "bottom-right";
    config.duration = 500;
    config.easing = 'cubic-bezier(0.645, 0.045, 0.355, 1)';

  }
  changeLang(lang: string) {
    this.translate.use(lang);
  }
}