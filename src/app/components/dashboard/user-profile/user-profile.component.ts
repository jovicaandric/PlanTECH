import { Component, OnInit, trigger, transition, style, animate } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { User } from "../../user-management/user.model";
declare var require: any;
//import rutera
var usernames: string[] = [];
var emails: string[] = [];
var userUsername: string;



@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css'],
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
export class UserProfileComponent implements OnInit {
    editFormName: FormGroup;
    editFormUsername: FormGroup;
    editFormEmail: FormGroup;
    editFormPassword: FormGroup;
    private user: User;
    private userCurrent;
    userId: string;
    imageUser: string;

    submitted = false;
    userThis: any;
    picture: any;
    slika: any;
    userAvatar: any;


    constructor(
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        if (localStorage.getItem('user') == null)
            this.router.navigate(['/login']);
        this.userCurrent = JSON.parse(localStorage.getItem('user'));
        this.imageUser = require("../../../../assets/dist/img/user.png");
    }

    ngOnInit() {
        this.getAllUsers();
        this.user = {
            id: this.userCurrent.Id,
            firstname: this.userCurrent.Firstname,
            lastname: this.userCurrent.Lastname,
            username: this.userCurrent.Username,
            email: this.userCurrent.Email,
            password: '',
            confirmPassword: ''
        }

        // this.slika = require('../../../../../routers/userImages/'+ this.userCurrent.Id + ".png");
        this.buildFormName();
        this.buildFormUsername();
        this.buildFormEmail();
        this.buildFormPassword();
        this.getImage();
    }

    getImage() {
        this.authService.getImage(this.userCurrent.Id).subscribe(data => {
            let image = JSON.parse(data.image);
            if (image[0].Image)
                this.userAvatar = location.protocol + "//" + window.location.hostname + ':2047/userImages/' + image[0].Image;
            else
                this.userAvatar = location.protocol + "//" + window.location.hostname + ':2047/userImages/user.png';
        });
    }

    buildFormPassword() {
        this.editFormPassword = this.fb.group({
            'password': [this.user.password, [Validators.required, Validators.minLength(8)]],
            'confirmPassword': [this.user.confirmPassword, [Validators.required]],
        }, { validator: this.validatePassword }
        );
        this.editFormPassword.valueChanges.subscribe(data => this.onValueChanged(this.editFormPassword, data));
        this.onValueChanged(this.editFormPassword);
    }

    buildFormName() {
        this.editFormName = this.fb.group({
            'firstname': [this.user.firstname, [Validators.required, Validators.minLength(2)]],
            'lastname': [this.user.lastname, [Validators.required, Validators.minLength(2)]],
        }
        );

        this.editFormName.valueChanges.subscribe(data => this.onValueChanged(this.editFormName, data));
        this.onValueChanged(this.editFormName);
    }


    buildFormEmail() {
        this.editFormEmail = this.fb.group({
            'email': [this.user.email, [Validators.required, CustomValidators.email]]
        }, { validator: this.validateEmail }
        );
        this.editFormEmail.valueChanges.subscribe(data => this.onValueChanged(this.editFormEmail, data));
        this.onValueChanged(this.editFormEmail);
    }


    buildFormUsername() {
        this.editFormUsername = this.fb.group({
            'username': [this.user.username, [Validators.required, Validators.minLength(5)]]
        }, { validator: this.validateUsername }
        );

        this.editFormUsername.valueChanges.subscribe(data => this.onValueChanged(this.editFormUsername, data));
        this.onValueChanged(this.editFormUsername);
    }

    validateUsername(group: FormGroup) {
        var username = group.controls['username'];

        if (usernames && usernames.indexOf(username.value) > -1) {
            username.setErrors({ 'username exists': true });
        }

        return null;
    }

    validatePassword(group: FormGroup) {
        var pw = group.controls['password'];
        var pw2 = group.controls['confirmPassword'];

        if (pw.value !== pw2.value) {// this is the trick
            pw2.setErrors({ equal: true });
        }

        return null;
    }

    validateEmail(group: FormGroup) {
        var email = group.controls['email'];

        if (emails && emails.indexOf(email.value) > -1) {
            email.setErrors({ 'email exists': true });
        }

        return null;
    }

    onValueChanged(group: FormGroup, data?: any) {
        if (!this.editFormName) { return; }
        const form = group;
        for (const field in this.formErrors) {
            this.formErrors[field] = "";
            const control = form.get(field);

            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {

                    this.formErrors[field] = messages[key] + "";
                }
            }
        }
    }

    getAllUsers() {
        this.authService.getAllUsers().subscribe(data => {
            let users: any = JSON.parse(data.user);
            users.forEach(user => {
                if (user['Username'] != this.userCurrent.Username) {
                    usernames.push(user["Username"]);
                }
                if (user['Email'] != this.userCurrent.Email) {
                    emails.push(user["Email"]);
                }
            });
        });
    }

    //submit forme
    onSubmitName() {
        this.submitted = true;
        this.user.id = this.userCurrent.Id;
        this.userCurrent.Firstname = this.user.firstname;
        this.userCurrent.Lastname = this.user.lastname;
        var userThis: any;
        userThis = this.editFormName.value;
        userThis.id = this.userCurrent.Id;
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(this.userCurrent));
        this.authService.editUserName(userThis).subscribe(data => {
            if (data.success) {
                this.router.navigate(['/user-profile']);
                this.toastyService.success({
                    title: 'Ime promenjeno',
                    msg: 'Uspešno ste promenili svoje ime i prezime'
                });
            } else {
                console.log(data.err);
                usernames = [];
                emails = [];
                // this.getAllUsernames();
                this.router.navigate(['/register']);
            }
        });
    }

    onSubmitUsername() {
        this.submitted = true;
        var userThis: any;
        userThis = this.editFormUsername.value;
        userThis.id = this.userCurrent.Id;
        this.userCurrent.Username = this.user.username;
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(this.userCurrent));
        this.authService.editUserUsername(userThis).subscribe(data => {
            if (data.success) {
                this.router.navigate(['/user-profile']);
                this.toastyService.success({
                    title: 'Korisničko ime promenjeno',
                    msg: 'Uspešno ste promenili svoje korisničko ime'
                });
            } else {
                console.log(data.err);
                usernames = [];
                emails = [];
                // this.getAllUsernames();
                this.router.navigate(['/register']);
            }
        });
    }

    onSubmitEmail() {
        this.submitted = true;
        this.userCurrent.Email = this.user.email;
        var userThis: any;
        userThis = this.editFormEmail.value;
        userThis.id = this.userCurrent.Id;
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(this.userCurrent));
        this.authService.editUserEmail(userThis).subscribe(data => {
            if (data.success) {
                this.router.navigate(['/user-profile']);
                this.toastyService.success({
                    title: 'Email promenjen',
                    msg: 'Uspešno ste promenili svoju email adresu'
                });
            } else {
                console.log(data.err);
                usernames = [];
                emails = [];
                // this.getAllUsernames();
                this.router.navigate(['/register']);
            }
        });
    }

    onSubmitPassword() {
        this.submitted = true;
        this.user = this.editFormPassword.value;
        this.user.id = this.userCurrent.Id;
        this.userCurrent.Password = this.user.password;
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(this.userCurrent));
        this.authService.editUserPassword(this.user).subscribe(data => {
            if (data.success) {
                this.router.navigate(['/user-profile']);
                this.toastyService.success({
                    title: 'Lozinka promenjena',
                    msg: 'Uspešno ste promenili svoju lozinku'
                });
            } else {
                console.log(data.err);
                usernames = [];
                emails = [];
                // this.getAllUsernames();
                this.router.navigate(['/register']);
            }
        });
    }


    formErrors = {
        'firstname': '',
        'lastname': '',
        'username': '',
        'email': '',
        'password': '',
        'confirmPassword': ''
    };
    validationMessages = {
        'firstname': {
            'required': "Please enter your firstname",
            'minlength': 'firstname short'
        },
        'lastname': {
            'required': "Please enter your lastname",
            'minlength': 'lastname short'
        },
        'username': {
            'required': "Please enter your username",
            'minlength': 'Username must be at least 5 characters long.',
            'username exists': 'username exists'
        },
        'email': {
            'required': "Please enter valid email address",
            'email': "Please enter valid email address",
            "email exists": "email exists"
        },
        'password': {
            'required': "Password is required (min 8 characters)",
            'minlength': "Password is required (min 8 characters)"
        },
        'confirmPassword': {
            'required': "Password mismatch",
            'equal': 'Password mismatch'
        }
    };


    uploadFile(event) {
        const files = event.target.files;

        if (files.length > 0) {
            let file;
            let formData = new FormData();
            file = files[0];
            formData.append('image', file, file.name);
            formData.append('userId', this.userCurrent.Id);

            this.authService.updateImage(formData).subscribe(res => {
                if (res) {
                }
            });

            this.toastyService.success({
                title: "Fotografija je sačuvana",
                msg: "Osvežite stranicu kako biste videli izmene.",
                showClose: true,
                timeout: 6000,
                theme: "default"
            });
        }
    }


    getMyStyles() {
        let myStyles = {
            'background-image': 'url(' + this.userAvatar + ')'

        };
        return myStyles;
    }
}

