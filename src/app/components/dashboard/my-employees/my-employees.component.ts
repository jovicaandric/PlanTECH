import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import swal from 'sweetalert2';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { User } from "../../user-management/user.model";
import { TranslateService } from 'ng2-translate';
var usernames: string[] = [];
var emails: string[] = [];
@Component({
  selector: 'app-my-employees',
  templateUrl: './my-employees.component.html',
  styleUrls: ['./my-employees.component.css']
})
export class MyEmployeesComponent implements OnInit {

  private userCurrent;
  private users: any = [];
  public plantages: any[] = [];
  private plantagesForEdit = [];
  private tempEmployees = [];
  private permissionTitles = ["Read measurements", "Read weather data", "Get notifications", "Change plantage details", "Change rules"];
  tempPlantage: any;
  permissions: any[] = [];
  private user: any = {
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    confirmedpassword: ""
  }
  showHead = 0;
  warnning: string = "Molimo odaberite dozvole za radnika";

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

    this.authService.getMyEmployees(this.userCurrent).subscribe(data => {
      // console.log(data);
      this.users = JSON.parse(JSON.stringify(data.employee));
      this.tempEmployees = JSON.parse(JSON.stringify(data.employee));
    });
    this.getPermissions();
    this.getPlantages();
  }

  checkIfWorks(pl) {
    for (var i = 0; i < 5; i++)
      if (pl.check[i] == true)
        return true;
    return false;
  }

  checkPerm(user, plant, ind) {
    this.tempEmployees[user].plantages[plant].check[ind] = !this.tempEmployees[user].plantages[plant].check[ind];
    // console.log(this.tempEmployees[user].plantages);
  }

  editEmployee(u) {
    this.authService.editPermissions(this.tempEmployees[u], this.userCurrent.Id).subscribe(data => {
      this.users[u] = JSON.parse(JSON.stringify(this.tempEmployees[u]));
      this.toastyService.success({
        title: 'Uspešna izmena',
        msg: 'Uspešno ste izmenili dozvole zaposlenog'
      });
    });
  }
  cancelEdit(u) {
    this.tempEmployees[u] = JSON.parse(JSON.stringify(this.users[u]));
  }

  checkUsername1 = false;
  checkPass1 = false;
  checkFirstname1 = false;
  checkLastname1 = false;
  checkEmail1 = false;

  checkUsername1Err = "";
  checkPass1Err = "";
  checkFirstname1Err = "";
  checkLastname1Err = "";
  checkEmail1Err = "";

  checkNameValid(name) {
    if (!/^[A-ž]+$/.test(name)) {
      this.checkFirstname1 = true;
      this.checkFirstname1Err = "firstnameErr1";
      return false;
    }
  }

  checkNameValid1(name) {
    if (!/^[A-ž]+$/.test(name)) {
      this.checkLastname1 = true;
      this.checkLastname1Err = "lastnameErr1";
      return false;
    }
  }

  checkEmail() {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(this.user.email)) {
      this.checkEmail1 = true;
      if (this.translateService.currentLang == 'en')
        this.checkEmail1Err = "Please enter valid email address.";
      else
        this.checkEmail1Err = "Unesite ispravan format email adrese.";
      return false;
    }
    this.checkEmail1 = false;
    this.checkEmail1Err = "";
  }

  checkUsername() {
    this.getAllUsers();
    if (this.user.username.length < 5) {
      this.checkUsername1 = true;
      if (this.translateService.currentLang == 'en')
        this.checkUsername1Err = "Username must be at least 5 characters long.";
      else
        this.checkUsername1Err = "Korisničko ime mora biti dugo najmanje 5 karaktera";
      return false;
    }

    for (var i = 0; i < usernames.length; i++) {
      if (this.user.username === usernames[i]) {
        this.checkUsername1 = true;

        if (this.translateService.currentLang == 'en')
          this.checkUsername1Err = "username exists";
        else
          this.checkUsername1Err = "Korisničko ime postoji";
        return false;
      }
    }
    this.checkUsername1 = false;
    this.checkUsername1Err = "";
  }

  checkFirstname() {
    if (this.user.firstname.length < 2) {
      this.checkFirstname1 = true;
      this.checkFirstname1Err = "firstnameErr";
      return false;
    }
    this.checkFirstname1 = false;
    this.checkFirstname1Err = "";
    this.checkNameValid(this.user.firstname);
  }

  checkLastname() {
    if (this.user.lastname.length < 2) {
      this.checkLastname1 = true;
      this.checkLastname1Err = "lastnameErr";
      return false;
    }
    this.checkLastname1 = false;
    this.checkLastname1Err = "";
    this.checkNameValid1(this.user.lastname);
  }

  checkPass() {
    if (this.user.password.length < 8) {
      this.checkPass1 = true;
      if (this.translateService.currentLang == 'en')

        this.checkPass1Err = "Password is required (min 8 characters)";
      else
        this.checkPass1Err = "Lozinka mora biti sastavljena od najmanje 8 karaktera";
      return false;
    }
    this.checkPass1 = false;
    this.checkPass1Err = "";
  }

  getAllUsers() {
    this.authService.getAllUsers().subscribe(data => {
      let users: any = JSON.parse(data.user);
      users.forEach(user => {
        usernames.push(user["Username"]);
      });
    });
  }

  formErrors = {
    'username': ''
  };
  validationMessages = {
    'username': {
      'required': "Please enter your username",
      'minlength': 'Username must be at least 5 characters long.',
      'username exists': 'username exists'
    }
  };

  getPlantages() {
    this.authService.getPlantages(this.userCurrent).subscribe(data => {
      let plantages: any = JSON.parse(data.plantages);
      plantages.forEach(plantage => {
        var permissions: any[] = [];

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
  addNewEmployee() {
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
    this.authService.addNewEmployee(this.user).subscribe(data => {
      if (data.success) {
        this.authService.getMyEmployees(this.userCurrent).subscribe(data => {
          // console.log(data);
          this.users = JSON.parse(JSON.stringify(data.employee));
          this.tempEmployees = JSON.parse(JSON.stringify(data.employee));
        });
        this.toastyService.success({
          title: 'Zaposleni dodat',
          msg: 'Uspešno ste dodali novog zaposlenog'
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

  dismissEmployee(employee) {
    console.log(employee);
    var title;
    var text;
    var deleteD;
    var cancel;
    if (this.translateService.currentLang == "srb") {
      title = "Da li ste sigurni da želite da otpustite ovog radnika?";
      text = "";
      deleteD = "Otpusti";
      cancel = "Poništi";
    }
    else {
      title = "Are you sure you want to dismiss this employee?";
      text = "";
      deleteD = "Dismiss";
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
      //console.log(this.userCurrent);
      employee.ownerId = this.userCurrent.Id;
      employee.ownerFirstname = this.userCurrent.Firstname;
      employee.ownerLastname = this.userCurrent.Lastname;
      this.authService.dismissEmployee(employee).subscribe(data => {
        if (data.success) {
          for (var i = 0; i < this.users.length; i++) {
            if (employee.UserID == this.users[i].UserID) {
              this.users.splice(i, 1);
              break;
            }
          }
          this.toastyService.success({
            title: 'Employee dismissed',
            msg: employee.Firstname + ' ' + employee.Lastname + ' successfuly dismissed'
          });
        }
        else {
          this.toastyService.error({
            title: 'Oops',
            msg: 'Something went wrong'
          });
        }
      });
    }, function (dismiss) {

    });
  }

}
