import { Component, OnInit } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin-topnav',
  templateUrl: './admin-topnav.component.html',
  styleUrls: ['./admin-topnav.component.css']
})
export class AdminTopnavComponent implements OnInit {
  user: any;
  constructor(private translateService: TranslateService,
    private authService: AuthService,
    private router: Router
  ) {
    if (localStorage.getItem('user') == null) {
      this.router.navigate(['/login']);

    }
    else if (JSON.parse(localStorage.getItem('user')).Role != "Admin")
      this.router.navigate(['/unautorized']);

    translateService.addLangs(['en', 'srb']);
    translateService.setDefaultLang('en');
    translateService.use('en');
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  currentLang = 'EN';

  changeLang(lang: string) {
    this.translateService.use(lang);
    if (lang === 'srb')
      this.currentLang = 'SRB';
    if (lang === 'en')
      this.currentLang = 'EN';
  }

  ngOnInit() {
  }

  onLogOut() {
    this.authService.logout();
  }


}
