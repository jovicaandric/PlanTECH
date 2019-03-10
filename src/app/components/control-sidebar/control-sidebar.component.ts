import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies';
import { AuthService } from "../../services/auth.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-control-sidebar',
  templateUrl: './control-sidebar.component.html',
  styleUrls: ['./control-sidebar.component.css']
})
export class ControlSidebarComponent implements OnInit {
  private theme: any;
  private sendToEmail;
  private userCurrent;
  private sendChecked;

  constructor(private authService: AuthService, private router: Router) {
    var themeInCookie = Cookie.get("theme");
    if (themeInCookie == "") {
      themeInCookie = "skin-green";
      Cookie.set("theme", "skin-green", 30);
    }
    this.userCurrent = JSON.parse(localStorage.getItem('user'));
    this.changeTheme(themeInCookie);

    if (this.userCurrent != null) {
      authService.getIfSendToEmail(JSON.parse(localStorage.getItem('user')).Id).subscribe(data => {

        let check: any = JSON.parse(data.checked);
        if (check[0] != null)
          this.sendChecked = check[0].EmailNotifications;
      });
    }
  }

  ngOnInit() {
  }
  changeTheme(classTag) {
    let body = document.getElementsByTagName('body')[0];
    let cn = "hold-transition sidebar-mini fixed " + classTag;
    //console.log(cn);
    body.className = cn;
    Cookie.delete("theme");
    Cookie.set("theme", classTag, 30);
  }

  updateCheck(event) {
    if (event.target.checked == true)
      this.sendChecked = 1;
    else
      this.sendChecked = 0;
    var dataToSend = {
      userId: this.userCurrent.Id,
      enable: event.target.checked
    }
    this.authService.sendToEmailCheck(dataToSend).subscribe(data => {
      if (data.success) {
        // console.log("success");
      }
      else {
        console.log(data.msg);
      }
    });
  }
}
