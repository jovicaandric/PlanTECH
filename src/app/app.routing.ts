import { Routes, RouterModule } from '@angular/router';
import { Router } from "@angular/router";
import { NgModule } from '@angular/core';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { LoginComponent } from './components/user-management/login/login.component';
import { BillingPlanComponent } from './components/user-management/billing-plan/billing-plan.component';
import { RegisterComponent } from './components/user-management/register/register.component';
import { IndexComponent } from './components/dashboard/index/index.component';
import { MapComponent } from './components/dashboard/map/map.component';
import { AdminComponent } from './components/admin/admin.component';
import { WeatherComponent } from './components/dashboard/weather/weather.component';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';
import { UnautorizedComponent } from './components/admin/unautorized/unautorized.component';
import { AdminOwnerRequestsComponent } from './components/admin/admin-owner-requests/admin-owner-requests.component';
import { HomeComponent } from './components/home/home.component';
import { UserProfileComponent } from './components/dashboard/user-profile/user-profile.component';
import { WorkRequestsComponent } from './components/dashboard/work-requests/work-requests.component';
import { PlantagesComponent } from './components/dashboard/plantages/plantages.component';
import { FindWorkComponent } from './components/dashboard/find-work/find-work.component';
import { JobOffersComponent } from './components/dashboard/job-offers/job-offers.component';
import { JobRequestsComponent } from './components/dashboard/job-requests/job-requests.component';
import { MyEmployeesComponent } from './components/dashboard/my-employees/my-employees.component';
import { NotificationsComponent } from './components/dashboard/notifications/notifications.component';
import { MeasurersComponent } from './components/dashboard/measurers/measurers.component';
import { PlantsComponent } from './components/dashboard/plants/plants.component';
import { RulesComponent } from './components/dashboard/rules/rules.component';
import { MyEmployersComponent } from './components/dashboard/my-employers/my-employers.component';
import { PlannerComponent } from './components/dashboard/planner/planner.component';
import { IntroductionComponent } from './components/dashboard/introduction/introduction.component';
import { AuthService } from './services/auth.service';
import { Observable } from "rxjs/Observable";

@Injectable()
export class protectorOfTheUser implements CanActivate {

    constructor(private router: Router) { }

    canActivate(): boolean {
        var user = JSON.parse(localStorage.getItem('user'));
        if (user != null) 
                return true;
            else {
                this.router.navigate(["/unautorized"]);
                return false;
            }
    }
}

@Injectable()
export class protectorOfTheAdmin implements CanActivate {

    constructor(private router: Router) { }

    canActivate(): boolean {
        var user = JSON.parse(localStorage.getItem('user'));
        if (user != null) {
            if (user.Role == "Admin")
                return true;
            else {
                this.router.navigate(["/unautorized"]);
                return false;
            }
        }
        this.router.navigate(["/unautorized"]);
        return false;
    }
}

@Injectable()
export class protectorOfThePlantages implements CanActivate {
    constructor(private router: Router,
        private authService: AuthService) {
    }

    canActivate(): Observable<boolean> | boolean {
        var user = JSON.parse(localStorage.getItem('user'));
        if (user != null) {
            return this.authService.checkIfCanSeePlantages(user.Id).map(data => {
                if (data) {
                    return true;
                }
                this.router.navigate(["/unautorized"]);
                return false;
            }).first();
        } else {
            this.router.navigate(["/unautorized"]);
            return false;
        }
    }
}

@Injectable()
export class protectorOfTheOwner implements CanActivate {
    constructor(private router: Router,
        private authService: AuthService) {
    }

    canActivate(): Observable<boolean> | boolean {
        var user = JSON.parse(localStorage.getItem('user'));
        if (user != null) {
            return this.authService.checkIfOwner(user.Id).map(data => {
                if (data) {
                    return true;
                }
                this.router.navigate(["/unautorized"]);
                return false;
            }).first();
        } else {
            this.router.navigate(["/unautorized"]);
            return false;
        }
    }
}

@Injectable()
export class protectorOfTheRule implements CanActivate {
    constructor(private router: Router,
        private authService: AuthService) {
    }

    canActivate(): Observable<boolean> | boolean {
        var user = JSON.parse(localStorage.getItem('user'));
        if (user != null) {
            return this.authService.checkIfRuler(user.Id).map(data => {
                if (data) {
                    return true;
                }
                this.router.navigate(["/unautorized"]);
                return false;
            }).first();
        } else {
            this.router.navigate(["/unautorized"]);
            return false;
        }
    }
}

const appRoutes: Routes = [
    //{ path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "", component: HomeComponent },
    { path: 'index', component: IndexComponent, canActivate: [protectorOfTheUser] },
    { path: 'map', component: MapComponent, canActivate: [protectorOfTheUser] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'admin', component: AdminUsersComponent, canActivate: [protectorOfTheAdmin] },
    { path: 'billingplan', component: BillingPlanComponent },
    { path: 'weather', component: WeatherComponent, canActivate: [protectorOfTheUser] },
    { path: 'plantages', component: PlantagesComponent, canActivate: [protectorOfThePlantages] },
    { path: 'admin/all-users', component: AdminUsersComponent, canActivate: [protectorOfTheAdmin] },
    { path: 'unautorized', component: UnautorizedComponent },
    { path: 'admin/owner-requests', component: AdminOwnerRequestsComponent, canActivate: [protectorOfTheAdmin] },
    { path: 'user-profile', component: UserProfileComponent, canActivate: [protectorOfTheUser] },
    { path: 'work-requests', component: WorkRequestsComponent, canActivate: [protectorOfTheOwner] },
    { path: 'find-work', component: FindWorkComponent, canActivate: [protectorOfTheUser] },
    { path: 'my-employees', component: MyEmployeesComponent, canActivate: [protectorOfTheOwner] },
    { path: 'my-employers', component: MyEmployersComponent, canActivate: [protectorOfTheUser] },
    { path: 'job-offers', component: JobOffersComponent, canActivate: [protectorOfTheUser] },
    { path: 'job-requests', component: JobRequestsComponent, canActivate: [protectorOfTheOwner] },
    { path: 'notifications', component: NotificationsComponent, canActivate: [protectorOfTheUser] },
    { path: 'measurers', component: MeasurersComponent, canActivate: [protectorOfThePlantages] },
    { path: 'plants', component: PlantsComponent, canActivate: [protectorOfTheOwner] },
    { path: 'rules', component: RulesComponent, canActivate: [protectorOfTheRule] },
    { path: 'planner', component: PlannerComponent, canActivate: [protectorOfTheUser] },
    { path: 'introduction', component: IntroductionComponent, canActivate: [protectorOfTheUser] },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule],
    providers: [protectorOfTheAdmin, protectorOfThePlantages, protectorOfTheOwner, protectorOfTheUser, protectorOfTheRule]
})
export class AppRouting { }

