import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from 'ng2-translate';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-topnav',
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.css']
})
export class TopnavComponent implements OnInit {

  constructor(private translateService: TranslateService,
              private authService: AuthService
  ) {
    translateService.addLangs(['en', 'srb']);
    translateService.setDefaultLang('en');
    translateService.use('en');
  }

  currentLang = 'EN';

  changeLang(lang: string) {
    this.translateService.use(lang);
    if(lang === 'srb')
      this.currentLang = 'SRB';
    if(lang === 'en')
      this.currentLang = 'EN';
  }

  ngOnInit() {
  }

  onLogOut() {
    this.authService.logout();
  }

}
