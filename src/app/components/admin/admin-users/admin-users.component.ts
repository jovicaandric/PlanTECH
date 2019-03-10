import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../user-management/user.model';
import { ModalModule } from "ng2-modal";
import swal from 'sweetalert2';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {

  private tempUser: any;
  public users: any[] = [];
  userCurrent: any;

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
    this.userCurrent = JSON.parse(localStorage.getItem('user'));
  }

  ngOnInit() {
    this.getData();
  }


  refresh() {
    this.getData();
  }

  getData() {

    this.authService.getAllUsers().subscribe(data => {
      let users: any = JSON.parse(data.user);
      this.users = [];
      users.forEach(user => {
        this.tempUser = {
          id: user["Id"],
          firstname: user["Firstname"],
          lastname: user["Lastname"],
          username: user["Username"],
          email: user["Email"],
        }
        if (this.tempUser.id != this.userCurrent.Id)
         this.users.push(this.tempUser);
      });
    });
  }


  //deleteUser

  public checked: boolean = false;

  toogle() {
    if (this.checked == true) {
      this.checked = false;
    }
    else {
      this.checked = true;
    }
  }


  showDeleteModal(user: User) {

    var title;
    var text;
    var deleteD;
    var cancel;
    if (this.translateService.currentLang == "srb"){
      title = "Da li ste sigurni da želite da obrišete korisnika " + user.username + "?"; 
      text = "";
      deleteD = "Obriši";
      cancel = "Poništi";
    }
    else {
      title = 'Are you sure you want to delete user ' + user.username + "?";
      text = "You won't be able to revert this!";
      deleteD = "Delete";
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
      this.authService.deleteUser(user).subscribe(data => {
        if (data.success) {
          this.deleteUser(user);
          var title;
          var msg;
          if (this.translateService.currentLang == 'srb') {
            title = "Korisnik je obrisan";
            msg = "Uspešno ste obrisali nalog korisnika " + user.username + ".";
          }
          else {
            title = "User deleted";
            msg = "You have successfully deleted " + user.username + "'s account";
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

  deleteUser(user: User) {
    console.log(user);
    for (var i = 0; i < this.users.length; i++) {
      if (this.users[i].id == user.id) {
        this.users.splice(i, 1);
        break;
      }
    }
    this.authService.deleteUser(user).subscribe();
  }

  //updateUser

  submitted = false;

  onSubmit() {
    this.submitted = true;
  }

  updateUser(user: User) {
    if (user.password === user.confirmPassword)
      this.authService.updateUser(user).subscribe(data => {
        if (data.success) {
          this.getData();
          var title;
          var msg;
          if (this.translateService.currentLang == "srb") {
            title = "Sačuvano";
            msg = "Izmene o korisniku su uspešno sačuvane";
          }
          else {
            title = "User updated";
            msg = "You have successfully updated user information";
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
          console.log(data.msg);
        }
      });
    else {
      console.log('passwords do not match');
    }
  }

  // filter

  search = '';

  filter() {

    this.users.length = 0;
    this.authService.getAllUsers().subscribe(data => {
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
