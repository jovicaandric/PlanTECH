import { Component, OnInit, trigger, transition, style, animate } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import swal from 'sweetalert2';
import { GoogleChartComponent } from "../../dashboard/weather/google-chart/google-chart.component";


@Component({
  selector: 'app-login',
  animations: [trigger(
    'enterAnimation', [
      transition(':enter', [
        style({ opacity: 0, }),
        animate('700ms', style({ opacity: 1 }))
      ])
    ]
  )],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {




  username: String;
  password: String;

  constructor(
    private authService: AuthService,
    private flashMessages: FlashMessagesService,
    private router: Router,
    private translateService: TranslateService
  ) { }

  ngOnInit() {

  }


  /*	hideError() {
		document.getElementById("alert-wrapper").style.left = "-100%";
		document.getElementById("alert-body").style.top = "-800px";				
	}*/

  google() {
    //this.router.navigate(["/google"]);
    this.authService.googleAuth().subscribe(data => {

    });
  }

  forgot() {
    swal({
      title: 'Unesite email',
      input: 'email',
      showCancelButton: true,
      confirmButtonText: 'Pošalji',
      cancelButtonText: "Otkaži",
      showLoaderOnConfirm: true,
      allowOutsideClick: false
    }).then((email) => {
      swal({
        type: 'success',
        title: 'Uspesno ste resetovali lozinku',
        html: 'Bice Vam poslat email sa novom lozinkom'
      });
      this.authService.forgot(email).subscribe(data => {

      });
    })
  }

  onLoginSubmit(formLogin) {
    console.log(formLogin.valid);
    const user = {
      username: this.username,
      password: this.password
    }

    if (formLogin.valid === true) {
      this.authService.authenticateUser(user).subscribe(data => {
        if (data.success) {

          this.authService.storeUserData(data.user);
          if (JSON.parse(data.user).Role == "Admin")
            this.router.navigate(["/admin/all-users"]);
          else
            this.router.navigate(['/index']);
          //Redirektovati na dashboard kad bude napravljen
        }
        else {
          if (this.currentLang == 'SRB')
            swal(
              '',
              'Uneli ste pogrešne podatke, pokušajte ponovo.',
              'error'
            )
          if (this.currentLang == 'EN')
            swal(
              'Oops...',
              "Sorry, we don't recognize these credentials, please try again.",
              'error'
            )
          //document.getElementById("alert-wrapper").style.left = "0px";
          //document.getElementById("alert-body").style.top = "100px";
        }
      });
    }

  }


  currentLang = 'SRB';

  changeLang(lang: string) {
    this.translateService.use(lang);
    if (lang === 'srb')
      this.currentLang = 'SRB';
    if (lang === 'en')
      this.currentLang = 'EN';
  }

}
