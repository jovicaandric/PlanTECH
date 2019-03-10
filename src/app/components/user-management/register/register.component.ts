import { Component, OnInit, trigger, transition, style, animate } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { User } from "../user.model";
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { TranslateService } from 'ng2-translate';
import swal from 'sweetalert2';


var usernames: string[] = [];
var emails: string[] = [];
@Component({
    selector: 'app-register',
    animations: [trigger(
        'enterAnimation', [
            transition(':enter', [
                style({ opacity: 0, }),
                animate('700ms', style({ opacity: 1 }))
            ])
        ]
    )],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    private user: User;
    private showBilling;
    plans = ['Free', 'Owner Basic', 'Owner Standard', 'Owner Premium'];


    submitted = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private translateService: TranslateService
    ) { setTimeout(function () { document.getElementById("forma").style.opacity = "1"; }, 1); }

    ngOnInit() {
        this.getAllUsers();
        this.user = {
            firstname: '',
            lastname: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
        this.buildForm();
        this.showBilling = false;

    }



    buildForm() {
        this.registerForm = this.fb.group({
            'firstname': [this.user.firstname, [Validators.required, Validators.minLength(2)]],
            'lastname': [this.user.lastname, [Validators.required, Validators.minLength(2)]],
            'username': [this.user.username, [Validators.required, Validators.minLength(5)]],
            'email': [this.user.email, [Validators.required, CustomValidators.email]],
            'password': [this.user.password, [Validators.required, Validators.minLength(8)]],
            'confirmPassword': [this.user.confirmPassword, [Validators.required]],
        }, { validator: this.validatePasswordConfirmation }
        );

        this.registerForm.valueChanges.subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }
    validatePasswordConfirmation(group: FormGroup) {
        var pw = group.controls['password'];
        var pw2 = group.controls['confirmPassword'];
        var username = group.controls['username'];
        var email = group.controls['email'];

        if (usernames && usernames.indexOf(username.value) > -1) {
            username.setErrors({ 'username exists': true });
        }
        if (emails && emails.indexOf(email.value) > -1) {
            email.setErrors({ 'email exists': true });
        }
        if (pw.value !== pw2.value) {// this is the trick
            pw2.setErrors({ equal: true });
        }

        return null;
    }

    onValueChanged(data?: any) {
        if (!this.registerForm) { return; }
        const form = this.registerForm;
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
                usernames.push(user["Username"]);
                emails.push(user["Email"]);
            });
        });
    }
    //submit forme
    onSubmit() {
        this.submitted = true;
        this.user = this.registerForm.value;
        this.authService.registerUser(this.user).subscribe(data => {
            if (data.success) {
                this.showBilling = !this.showBilling;
            } else {
                console.log(data.err);
                //this.flashMessages.show(data.msg, { cssClass: "alert-danger", timeout: 3000 });
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


    currentLang = 'SRB';

    changeLang(lang: string) {
        this.translateService.use(lang);
        if (lang === 'srb')
            this.currentLang = 'SRB';
        if (lang === 'en')
            this.currentLang = 'EN';
    }

    // Billing Plan

    private tempUserId: any;

    write(planID: number) {
        this.authService.getOwnerId(this.user).subscribe(data => {
            let users: any = JSON.parse(data.user);
            users.forEach(user => {
                //this.tempUserId = (user["Id"]);
                var dataToSend = {
                    Owner: user["Id"],
                    BillingPlan: planID,
                    Resolved: "pending"
                };

                switch (planID) {
                    case 0: {
                        var title;
                        var text;
                        if (this.translateService.currentLang == "srb") {
                            title = "Registracija završena!";
                            text = "Uspešno ste se registrovali! Prijavite se kako biste koristili aplikaciju.";
                        }
                        else {
                            title = 'Registration completed!';
                            text = 'You have successfuly registered! Please login to continue.';
                        }
                        swal({
                            title: title,
                            text: text,
                            type: 'success',
                            timer: 4000
                        }).then(
                            function () {
                                // this.router.navigate(['/login']);
                            },
                            // handling the promise rejection
                            function (dismiss) {
                                // this.router.navigate(['/login']);
                                if (dismiss === 'timer') {
                                    console.log('I was closed by the timer')
                                }
                            }
                            )
                        this.router.navigate(['/login']);
                        break;
                    }
                    default: {
                        this.authService.addOwnerRequest(dataToSend).subscribe(data => {
                            if (data.success) {
                                var title;
                                var text;
                                if (this.translateService.currentLang == "srb") {
                                    title = "Registracija završena!";
                                    text = "Uspešno ste se registrovali! Molimo sačekajte da administrator potvrdi Vaš zahtev za vlasništvo";
                                }
                                else {
                                    title = 'Registration completed!';
                                    text = 'You have successfuly registered! Please wait for our admin to approve your owner request.';
                                }
                                swal({
                                    title: title,
                                    text: text,
                                    type: 'success',
                                    timer: 4000
                                }).then(
                                    function () {

                                    },
                                    // handling the promise rejection
                                    function (dismiss) {

                                        console.log("dismiss");

                                        if (dismiss === 'timer') {
                                            console.log('I was closed by the timer')
                                        }
                                    }
                                    )

                            }
                            else {
                                if (this.translateService.currentLang == "srb") {
                                    title = "";
                                    text = "Došlo je do greške. Molimo pokušajte ponovo.";
                                }
                                else {
                                    title = '';
                                    text = 'Something went wrong. Please try again.';
                                }
                                swal({
                                    title: title,
                                    text: text
                                })
                            }
                        });
                        this.router.navigate(['/login']);
                        break;
                    }
                }
            });
        });
    }


}