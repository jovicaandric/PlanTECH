import { Component, OnInit, trigger, transition, style, animate } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { User } from "../../user-management/user.model";
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import swal from 'sweetalert2';
declare var require: any;

@Component({
  selector: 'app-work-requests',
  templateUrl: './work-requests.component.html',
  styleUrls: ['./work-requests.component.css'],
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
export class WorkRequestsComponent implements OnInit {

  userPic: string;
  tempUser: any;
  showHead = 0;
  search = '';
  public users: any[] = [];
  public usersToShow: any[] = [];
  userCurrent: any;
  public plantages: any[] = [];
  tempPlantage: any;
  selectedUser: number;
  message: string = "";
  requestText = "send";
  permissions: any[] = [];
  requestedWorks: any[] = [];
  warnning: string = "Izaberite dozvole za radnika";
  selectAllC;



  constructor(
    private authService: AuthService,
    private router: Router,
    private toastyService: ToastyService, private toastyConfig: ToastyConfig,

  ) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);
    this.userCurrent = JSON.parse(localStorage.getItem('user'));
    this.toastyConfig.theme = 'default';
    this.toastyConfig.position = "bottom-right";
  }



  ngOnInit() {
    this.userPic = location.protocol + "//" + window.location.hostname + ':2047/userImages/user.png';;
    this.getPermissions();
    this.getRequested();
  }


  getRequested() {
    this.authService.getRequested().subscribe(data => {
      console.log(JSON.parse(data.requested));
      let requests: any = JSON.parse(data.requested);
      requests.forEach(req => {

        var request = {
          worker: req['Worker'],
          status: req['Resolved'],
          author: req['Author']
        };
        this.requestedWorks.push(request);
      });
    });
  }

  getData() {

    if (this.search == "")
      this.users = [];
    else {
      this.authService.getUsersForRequests().subscribe(data => {
        let users: any = JSON.parse(data.user);
        this.users = [];
        users.forEach(user => {
          var regexp = new RegExp(this.search, "i");
          var test = regexp.test(user['Username']);

          if (test == true) {
            var exists = 0;
            for (var i = 0; i < this.requestedWorks.length; i++) {
              if (this.requestedWorks[i].worker == user['Id'] && this.requestedWorks[i].author == this.userCurrent['Id']) {
                exists = 1;//cancel
              }
              if (this.requestedWorks[i].worker == user['Id'] && this.requestedWorks[i].status == "pending"
                && this.requestedWorks[i].author == this.userCurrent['Id']) {
                exists = 2;
              }

            }
            var sent: any;
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


  getPermissions() {
    this.authService.getPermissions().subscribe(data => {
      let permissions: any = JSON.parse(data.permissions);
      permissions.forEach(permission => {
        var permission;
        permission = {
          id: permission['Id'],
          title: permission["Title"]
        }
        this.permissions.push(permission);
      });
    });
  }

  userSelect(user: any) {
    this.selectedUser = user.id;
    this.message = "";
    this.plantages.length = 0;

    this.authService.getPlantages(this.userCurrent).subscribe(data => {
      let plantages: any = JSON.parse(data.plantages);
      plantages.forEach(plantage => {
        var permissions: any[] = [];
        for (var i = 0; i < this.permissions.length; i++) {

        }

        this.tempPlantage = {
          id: plantage['Id'],
          name: plantage['Name'],
          owner: plantage['Owner'],
          checked: "false",
          p1: false,
          p2: false,
          p3: false,
          p4: false,
          p5: false
        }
        this.plantages.push(this.tempPlantage);
      });
    });
  }




  changeText() {
    if (this.requestText == "send")
      this.requestText = "cancel";
    else this.requestText = "send";



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
      owner: this.userCurrent.Id,
      worker: this.selectedUser,
      plantagesPermissions: []
    };


    for (var i = 0; i < this.plantages.length; i++) {

      var permissions = [];

      if (this.plantages[i].p1 == true) permissions.push(1);
      if (this.plantages[i].p2 == true) permissions.push(2);
      if (this.plantages[i].p3 == true) permissions.push(3);
      if (this.plantages[i].p4 == true) permissions.push(4);
      if (this.plantages[i].p5 == true) permissions.push(5);



      if (this.plantages[i].checked == true) {
        dataToSend.plantagesPermissions.push({
          userId: this.selectedUser,
          plantageId: this.plantages[i].id,
          permissions: permissions
        });
      }
    }

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
      msg: "Vaš zahtev je uspešno poslat",
      showClose: true,
      timeout: 4000,
      theme: "default"
    });

  }

  updateCheckedOptions(option, plantage, event) {
    for (var i = 0; i < this.plantages.length; i++) {
      if (this.plantages[i].id == plantage.id) {
        var e = event.target.value;
        var c = event.target.checked;

        if (e == "p1") this.plantages[i].p1 = c;
        if (e == "p2") this.plantages[i].p2 = c;
        if (e == "p3") this.plantages[i].p3 = c;
        if (e == "p4") this.plantages[i].p4 = c;
        if (e == "p5") this.plantages[i].p5 = c;
      }
    }
  }

  updatePlantageCheck(plantage, event) {

    for (var i = 0; i < this.plantages.length; i++) {

      if (this.plantages[i].id == plantage.id) {
        if (event.target.checked == false) {
          this.plantages[i].p1 = this.plantages[i].p2 = this.plantages[i].p3
            = this.plantages[i].p4 = this.plantages[i].p5 = false;
          this.plantages[i].checked = false;
        }
        else {
          this.plantages[i].checked = true;
          this.showHead = 1;

        }
      }
    }


    var c = 0;
    for (var i = 0; i < this.plantages.length; i++) {
      if (this.plantages[i].checked == true)
        c = 1;
    }

    if (c == 0) this.showHead = 0;
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
      text: 'Želite da obrišete zahtev poslat korisniku ' + user.firstname + " " + user.lastname + "?",
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Obriši',
      cancelButtonText: 'Poništi brisanje',
      confirmButtonClass: 'btn btn-primary',
      cancelButtonClass: 'btn btn-danger'
    }).then(() => {
      var data = {
        worker: user.id,
        author: this.userCurrent['Id']
      }
      this.authService.deleteRequest(data).subscribe();
      this.updateText();
    }, function (dismiss) {
    });
  }

  selectAll(event) {

    if (event.target.checked == true) {
      this.selectAllC = true;
      for (var i = 0; i < this.plantages.length; i++) {
        this.plantages[i].checked = true;
        this.plantages[i].p1 = this.plantages[i].p2 = this.plantages[i].p3
          = this.plantages[i].p4 = this.plantages[i].p5 = true;
      }
    }
    else
      for (var i = 0; i < this.plantages.length; i++) {
        this.selectAllC = false;
        this.plantages[i].checked = false;
      }
  }


}

