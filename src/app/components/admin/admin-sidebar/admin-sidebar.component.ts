import { Component, OnInit } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

declare var require: any;

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit {

  user: any;
  userAvatar: any;
  private ownerRequests;
  constructor(private translateService: TranslateService,
    private authService: AuthService,
    private router: Router) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);


    translateService.addLangs(['en', 'srb']);
    translateService.setDefaultLang('en');
    translateService.use('en');
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  ngOnInit() {
    this.getOwnerRequests();
    this.getImage();
  }

  getImage() {
    this.authService.getImage(this.user.Id).subscribe(data => {
      let image = JSON.parse(data.image);
      // console.log("im = " + image[0].Image);
      if (image[0].Image)
        this.userAvatar = location.protocol + "//" + window.location.hostname + ':2047/userImages/' + image[0].Image;
      else
        this.userAvatar = location.protocol + "//" + window.location.hostname + ':2047/userImages/user.png';
    });
  }


  getOwnerRequests() {
    this.authService.getOwnerRequests().subscribe(data => {
      this.ownerRequests = JSON.parse(data.user);
    });
  }
  private profile = location.protocol + "//" + window.location.hostname + ':2047/userImages/user.png';

}
