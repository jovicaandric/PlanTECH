import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../user-management/user.model';
import { ModalDirective } from 'ng2-bootstrap/modal';
import swal from 'sweetalert2';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'app-admin-owner-requests',
  templateUrl: './admin-owner-requests.component.html',
  styleUrls: ['./admin-owner-requests.component.css']
})
export class AdminOwnerRequestsComponent implements OnInit {

  public users: any[] = [];
  private tempUser: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastyService: ToastyService, private toastyConfig: ToastyConfig,
    private translateService: TranslateService
  ) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);
    this.toastyConfig.theme = 'default';
    this.toastyConfig.position = "bottom-right";
  }

  ngOnInit() {
    this.getOwnerRequests();
  }


  refresh() {
    this.getOwnerRequests();
  }


  getOwnerRequests() {
    this.users.length = 0;
    this.authService.getOwnerRequests().subscribe(data => {
      this.users = JSON.parse(data.user);
    });
  }

  rejectRequest(user) {
    var title;
    var text;
    var deleteD;
    var cancel;
    if (this.translateService.currentLang == "srb") {
      title = "Da li ste sigurni da želite da odbijete zahtev za vlasništvo ovog korisnika?";
      text = "";
      deleteD = "Odbij zahtev";
      cancel = "Poništi";
    }
    else {
      title = 'Are you sure you want to reject owner request for this user?';
      text = "You won't be able to revert this!";
      deleteD = "Reject";
      cancel = "Cancel";
    }
    swal({
      text: title,
      type: 'question',
      showCancelButton: true,
      confirmButtonText: deleteD,
      cancelButtonText: cancel,
      confirmButtonClass: 'btn btn-danger',
      cancelButtonClass: 'btn btn-default'
    }).then(() => {
      this.authService.discardRegistration(user).subscribe(data => {
        if (data.success) {
          this.removeReq(user);
          var title;
          var msg;
          if (this.translateService.currentLang == 'srb') {
            title = "Zahtev je odbijen";
            msg = "Uspešno ste odbili zahtev za vlasništvo.";
          }
          else {
            title = "Request rejected";
            msg = "You have successfuly rejected ownership request";
          }
          this.toastyService.success({
            title: title,
            msg: msg,
            showClose: true,
            timeout: 5000,
            theme: "default"
          });
        }
        else {
          console.log('ne');
        }
      });

    }, function (dismiss) {
    });

  }

  removeReq(user) {
    for (var i = 0; i < this.users.length; i++) {
      if (user.Id == this.users[i].Id) {
        this.users.splice(i, 1);
      }
    }
  }
  confirmRequest(user) {
    var title;
    var text;
    var deleteD;
    var cancel;
    if (this.translateService.currentLang == "srb") {
      title = "Želite da prihvatite zahtev za vlasništvo ovog korisnika?";
      text = "";
      deleteD = "Prihvati zahtev";
      cancel = "Poništi";
    }
    else {
      title = 'You want to accept owner request for this user?';
      text = "";
      deleteD = "Accept";
      cancel = "Cancel";
    }
    swal({
      text: title,
      type: 'question',
      showCancelButton: true,
      confirmButtonText: deleteD,
      cancelButtonText: cancel,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-default'
    }).then(() => {
      this.authService.confirmRegistration(user).subscribe(data => {
        console.log(user);
        if (data.success) {
          this.removeReq(user);

          var title;
          var msg;
          if (this.translateService.currentLang == 'srb') {
            title = "Zahtev je prihvaćen";
            msg = "Uspešno ste prihvatili zahtev za vlasništvo.";
          }
          else {
            title = "Request accepted";
            msg = "You have successfuly accepted ownership request";
          }
          this.toastyService.success({
            title: title,
            msg: msg,
            showClose: true,
            timeout: 5000,
            theme: "default"
          });
        } else {
          console.log('ne');
        }
      });
    }, function (dismiss) {
    });
  }


  // filter

  search = '';

  filter() {

    this.users.length = 0;
    this.authService.getOwnerRequests().subscribe(data => {
      let users: any = JSON.parse(data.user);
      users.forEach(user => {
        var regexp = new RegExp(this.search, "i");

        if (regexp.test(user['Username']) == true || regexp.test(user['Email']) == true ||
          regexp.test(user['Id']) == true || regexp.test(user['Firstname']) == true || regexp.test(user['Lastname']) == true) {

          this.tempUser = {
            id: user["Id"],
            firstname: user["Firstname"],
            lastname: user["Lastname"],
            username: user["Username"],
            email: user["Email"],
          }
          this.users.push(this.tempUser);
        }
      });
    });
  }

}
