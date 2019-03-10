import { Component, OnInit, trigger, transition, style, animate } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { User } from "../../user-management/user.model";
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
declare var require: any;

@Component({
  selector: 'app-job-requests',
  templateUrl: './job-requests.component.html',
  styleUrls: ['./job-requests.component.css'],
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
export class JobRequestsComponent implements OnInit {

  private jobRequests: any = [];
  private userCurrent: any;
  public plantages: any[] = [];
  permissions: any[] = [];
  tempPlantage: any;
  selectedUser: any;
  message: any;
  showHead = 0;
  warnning: string = "Please choose permissions";
  user: any = {
    Id: 0,
    Ident: 0
  };
  selectAllC;

  constructor(
    private authService: AuthService,
    private toastyService: ToastyService
    ) {
    this.userCurrent = JSON.parse(localStorage.getItem('user'));
    this.getJobRequests();
    this.getPlantages();
    this.getPermissions();
  }

  ngOnInit() {
    console.log(this.jobRequests);
  }

  getJobRequests() {
    this.jobRequests.length = 0;
    this.authService.getJobRequests(this.userCurrent.Id).subscribe(data => {
      console.log(data);
      this.jobRequests = JSON.parse(data.offers);
    });
  }
  // acceptOffer(offerId) {
  //   this.authService.acceptOffer(offerId).subscribe();
  //   this.removeRequest(offerId);
  // }
  refuseRequest(offerId) {
    swal({
      title: 'Are you sure you want to dismiss this job application?',
      text: "You won't be able to revert this!",
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonClass: 'btn btn-danger',
      cancelButtonClass: 'btn btn-default'
    }).then(() => {
      this.authService.refuseOffer(offerId).subscribe(data => { 
          this.removeRequest(offerId);
          this.toastyService.success({
            title: 'Employee dismissed',
            msg: 'Job application successfuly dismissed'
          });
      });
    });
  }

  removeRequest(id) {
    for (var i = 0; i < this.jobRequests.length; i++) {
      if (this.jobRequests[i].Id == id) {
        this.jobRequests.splice(i, 1);
        break;
      }
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

  getPlantages() {
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

  acceptReq(offer: any) {
    console.log(offer);
    this.user.Id = offer.Ident; //id usera
    this.user.Ident = offer.Id; //id offera
    this.user.plantages = [];
    for (var i = 0; i < this.plantages.length; i++) {
      if (this.plantages[i].checked == true) {
        this.user.plantages.push({
          plantageId: this.plantages[i].id,
          name: this.plantages[i].name,
          permissions: []
        });
        var pl = this.user.plantages.length - 1;
        if (this.plantages[i].p1 == true)
          this.user.plantages[pl].permissions.push(1);
        if (this.plantages[i].p2 == true)
          this.user.plantages[pl].permissions.push(2);
        if (this.plantages[i].p3 == true)
          this.user.plantages[pl].permissions.push(3);
        if (this.plantages[i].p4 == true)
          this.user.plantages[pl].permissions.push(4);
        if (this.plantages[i].p5 == true)
          this.user.plantages[pl].permissions.push(5);
      }
    }
    //console.log('zovemm servis sa ' + this.user.Id + ' offer: ' + this.user.Ident + ' ' + this.user.plantages);
    this.authService.acceptJobReq(this.user).subscribe(data => {
        if(data.success) {  
          this.toastyService.success({
            title: 'Job applications accepted',
            msg: 'You have successfuly accepted ' + offer.firstname + ' ' + offer.lastname + "'s" + ' job application'
          });
          this.removeRequest(offer.Id);
        }
        else {
          this.toastyService.error({
            title: 'Oops',
            msg: 'Something went wrong'
          });
        }
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
