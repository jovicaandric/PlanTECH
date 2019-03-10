import { Component, OnInit, trigger, transition, style, animate } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { User } from "../../user-management/user.model";
declare var require: any;
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import swal from 'sweetalert2';

@Component({
  selector: 'app-find-work',
  templateUrl: './find-work.component.html',
  styleUrls: ['./find-work.component.css'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ height: 0, opacity: 0, }),
          animate('500ms', style({ height: "*", opacity: 1 }))
        ]),
        transition(':leave', [
          style({ height: "*", opacity: 1 }),
          animate('500ms', style({ height: 0, opacity: 0 }))
        ])
      ]
    ),
    trigger(
      'slideIn', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('500ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          style({ height: "*", opacity: 1 }),
          animate('500ms', style({ height: 0, opacity: 0 }))
        ])
      ]
    )
  ]
})
export class FindWorkComponent implements OnInit {

  userPic: string;
  tempUser: any;
  search = '';
  public users: any[] = [];
  public usersToShow: any[] = [];
  userCurrent: any;
  public plantages: any[] = [];
  tempPlantage: any;
  selectedUser: number;
  message: string;
  requestedWorks: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig
  ) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);
    this.userCurrent = JSON.parse(localStorage.getItem('user'));
  }


  ngOnInit() {
    this.userPic = location.protocol + "//" + window.location.hostname + ':2047/userImages/user.png';;
    this.getRequested();
  }

  getData() {

    if (this.search == "")
      this.users = [];
    else {

      this.authService.getUsersForRequests2().subscribe(data => {
        let users: any = JSON.parse(data.user);
        this.users = [];
        users.forEach(user => {
          var regexp = new RegExp(this.search, "i");
          var test = regexp.test(user['Username']);

          if (test == true) {
            var exists = 0;
            for (var i = 0; i < this.requestedWorks.length; i++) {
              if (this.requestedWorks[i].owner == user['Id'] && this.requestedWorks[i].author == this.userCurrent['Id']) {
                exists = 1;//cancel
                console.log("Usw=" + user['Id'] + " " + user['Firstname']);
              }
              if (this.requestedWorks[i].owner == user['Id'] && this.requestedWorks[i].status == "pending"
                && this.requestedWorks[i].author == this.userCurrent['Id']) {
                exists = 2;
              }
            }
            var sent;
            if (exists == 0) sent = "Send request";
            else if (exists == 2) sent = "Cancel request";

            var img;

            if (user['Image'])
              img = location.protocol + "//" + window.location.hostname + ':2047/userImages/' + user['Image'];
            else
              img = location.protocol + "//" + window.location.hostname + ':2047/userImages/user.png';

            if ((exists == 0 || exists == 2) && user['Id'] != this.userCurrent['Id']) {
              this.tempUser = {
                id: user["Id"],
                firstname: user["Firstname"],
                lastname: user["Lastname"],
                username: user["Username"],
                email: user["Email"],
                sent: sent,
                image: img
              }
              this.users.push(this.tempUser);
            }
          }
        });
      });
    }

  }

  getRequested() {
    this.authService.getRequested().subscribe(data => {
      console.log(data);
      let requests: any = JSON.parse(data.requested);
      requests.forEach(req => {

        var request = {
          worker: req['Worker'],
          owner: req['Owner'],
          status: req['Resolved'],
          author: req['Author']
        };
        this.requestedWorks.push(request);

      });
    });
  }
  userSelect(user) {
    this.selectedUser = user.id;
    this.message = "";
  }

  sendRequest() {
    for (var i = 0; i < this.users.length; i++) {
      if (this.users[i].id == this.selectedUser) {
        if (this.users[i].sent == "Send request")
          this.users[i].sent = "Cancel request";
        else
          this.users[i].sent = "Send request";
      }
    }

    var dataToSend = {
      author: this.userCurrent.Id,
      message: this.message,
      owner: this.selectedUser,
      worker: this.userCurrent.Id
    };

    this.authService.messagePermissions(dataToSend).subscribe(data => {
      if (data.success) {
        console.log("success");
      }
      else {
        console.log(data.msg);
      }
    });

    this.toastyService.success({
      title: "Zahtev je poslat",
      msg: "Vaš zahtev je uspešno poslat.",
      showClose: true,
      timeout: 4000,
      theme: "default"
    });
  }

  updateText() {
    for (var i = 0; i < this.users.length; i++) {
      if (this.users[i].id == this.selectedUser) {
        if (this.users[i].sent == "Send request")
          this.users[i].sent = "Cancel request";
        else
          this.users[i].sent = "Send request";
      }
    }
  }



  deleteRequest(user) {
    this.selectedUser = user.id;
    swal({
      text: 'Želite da obrišete zahtev poslat vlasniku ' + user.firstname + " " + user.lastname + "?",
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Obriši',
      cancelButtonText: 'Poništi brisanje',
      confirmButtonClass: 'btn btn-primary',
      cancelButtonClass: 'btn btn-danger'
    }).then(() => {
      var data = {
        owner: user.id,
        author: this.userCurrent['Id']
      }
      this.authService.deleteRequest2(data).subscribe();
      this.updateText();
    }, function (dismiss) {
    });
  }
}
