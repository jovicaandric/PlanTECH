import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { TranslateService } from 'ng2-translate';
@Component({
  selector: 'app-my-employers',
  templateUrl: './my-employers.component.html',
  styleUrls: ['./my-employers.component.css']
})
export class MyEmployersComponent implements OnInit {

  private userCurrent;
  public owners: any[] = [];
  public plantages: any[] = [];
  tempPlantage: any;
  public show = 0;
  permissions: any[] = [];
  warnning: string = "Please choose permissions";

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastyService: ToastyService,
    private translateService: TranslateService
    ) { 
      if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);
      this.userCurrent = JSON.parse(localStorage.getItem('user'));
    }

  ngOnInit() {
    this.authService.getEmployersForUser(this.userCurrent).subscribe(data => {
      this.owners = JSON.parse(data.owners);
      this.show = this.owners.length;

      this.authService.getPlantagesIWorkOn(this.userCurrent).subscribe(data=> {
        this.plantages = JSON.parse(data.plantages);
        this.getData();
      });
      this.getPermissions();
    });
   
    //console.log(this.plantages[0]);
  }

  getData() {
    this.owners.forEach(item => {
      item.plantages = [];
      for(var i = 0; i < this.plantages.length; i++) {
        if(item.Id == this.plantages[i].Owner) {
          item.plantages.push(this.plantages[i]);
        }
      }
    });
  }

  removeOwner(owner) {
    this.owners.forEach(item => {
      if(item.Id == owner.Id)
        this.owners.splice(item);
    }); 
  }

  resign(owner) {
    var title;
    var text;
    var deleteD;
    var cancel;
    if (this.translateService.currentLang == "srb"){
      title = "Da li ste sigurni da želite da date otkaz?"; 
      text = "";
      deleteD = "Daj otkaz";
      cancel = "Poništi";
    }
    else {
      title = "Are you sure you want to quit working for this owner?";
      text = "";
      deleteD = "Quit working";
      cancel = "Cancel";
    }
    swal({
      title: title,
      text: text,
      type: 'question',
      showCancelButton: true,
      confirmButtonText: deleteD,
      cancelButtonText: cancel,
      confirmButtonClass: 'btn btn-danger',
      cancelButtonClass: 'btn btn-default'
    }).then(() => {
        var dataToSend:any = {
          userId: this.userCurrent.Id,
          owner: owner.Id,
          Firstname: this.userCurrent.Firstname,
          Lastname: this.userCurrent.Lastname,
          plantages: ''
        }
        for(var i=0; i < owner.plantages.length; i++) {
          if(i == owner.plantages.length - 1) {
            dataToSend.plantages += owner.plantages[i].Id;
          }
          else 
            dataToSend.plantages += owner.plantages[i].Id + ',';
        }

        this.authService.quit(dataToSend).subscribe(data => {
          if(data.success) {
            this.removeOwner(owner);
            this.toastyService.success({
              title: 'You quit your job',
              msg: 'You have successfult quit your job'
            });
          }
          else {
            this.toastyService.error({
              title: 'Oops',
              msg: 'Something went wrong'
            });
          }
        });
        
      }
      
   // console.log(dataToSend);
  )}

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
          //this.showHead = 1;
        }
      }
    }
  }
}
