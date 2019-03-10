import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Http } from '@angular/http';
import { AppComponent } from './app.component';
import { RegisterComponent } from './components/user-management/register/register.component';
import { AuthService } from './services/auth.service';
import { MapService } from './services/map.service';
import { WeatherService } from './services/weather.service';
import { LoginComponent } from './components/user-management/login/login.component';
import { FlashMessagesModule } from 'angular2-flash-messages';
//import { routing } from './app.routing';
import { RouterModule } from '@angular/router';
import { AppRouting } from './app.routing';
import { TranslateModule } from 'ng2-translate';
import { TranslateLoader } from 'ng2-translate';
import { TranslateStaticLoader } from 'ng2-translate';
import { IndexComponent } from './components/dashboard/index/index.component';
import { MapComponent } from './components/dashboard/map/map.component';
import { TopnavComponent } from './components/topnav/topnav.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminTopnavComponent } from './components/admin/admin-topnav/admin-topnav.component';
import { AdminSidebarComponent } from './components/admin/admin-sidebar/admin-sidebar.component';
import { BillingPlanComponent } from './components/user-management/billing-plan/billing-plan.component';
import { nvD3 } from 'ng2-nvd3';
import { NgxChartsModule } from '@swimlane/ngx-charts';
//import { Tab } from './components/dashboard/weather/tab/tab.component';
import { Tabs } from './components/dashboard/weather/tabs/tabs.component';
import { WeatherComponent } from './components/dashboard/weather/weather.component';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';
import { UnautorizedComponent } from './components/admin/unautorized/unautorized.component';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
//import { ModalModule } from 'ng2-bootstrap/modal';
import { ModalModule } from 'ng2-modal';
import { AdminOwnerRequestsComponent } from './components/admin/admin-owner-requests/admin-owner-requests.component';
import { HomeComponent } from './components/home/home.component';
import { SelectModule } from 'ng2-select';
import { UserProfileComponent } from './components/dashboard/user-profile/user-profile.component';
import { ControlSidebarComponent } from './components/control-sidebar/control-sidebar.component';
import { MyDatePickerModule } from 'mydatepicker';
import { DataTableModule } from "angular2-datatable";
import { PlantagesComponent } from './components/dashboard/plantages/plantages.component';
import { PopoverModule } from "ngx-popover";
import { PlantageWidgetComponent } from './components/dashboard/plantages/plantage-widget/plantage-widget.component';
import { WeatherWidgetComponent } from './components/dashboard/weather/weather-widget/weather-widget.component';
import { WorkRequestsComponent } from './components/dashboard/work-requests/work-requests.component';
import { FindWorkComponent } from './components/dashboard/find-work/find-work.component';
import { MyEmployeesComponent } from './components/dashboard/my-employees/my-employees.component';
import { JobOffersComponent } from './components/dashboard/job-offers/job-offers.component';
import { JobRequestsComponent } from './components/dashboard/job-requests/job-requests.component';
import { MapWidgetComponent } from './components/dashboard/map/map-widget/map-widget.component';
import { SwiperModule } from 'angular2-useful-swiper';
import { NguiMapModule } from '@ngui/map';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { NouisliderModule } from 'ng2-nouislider'
//import { PrecipGraphComponent } from './components/dashboard/weather/precip-graph/precip-graph.component';
import { PrecipProbGraphComponent } from './components/dashboard/weather/precip-prob-graph/precip-prob-graph.component';
import { ToastyModule } from 'ng2-toasty';
import { TabsModule } from "ngx-tabs";

//import { GraphComponent } from './components/dashboard/graph/graph.component';
//import { ClimateChartComponent } from './components/dashboard/climate-chart/climate-chart.component';
import { WindComponent } from './components/dashboard/weather/wind/wind.component';
import { NotificationService } from './services/notification.service';
import { NotificationsComponent } from './components/dashboard/notifications/notifications.component';
import { MeasurersComponent } from './components/dashboard/measurers/measurers.component';
import { RulesComponent } from './components/dashboard/rules/rules.component';
import { WeatherPlantageComponent } from './components/dashboard/weather/weather-plantage/weather-plantage.component';
import { GoogleChartComponent } from './components/dashboard/weather/google-chart/google-chart.component';
import { PlantsComponent } from './components/dashboard/plants/plants.component';
import { NgsRevealModule } from 'ng-scrollreveal';
import { MyEmployersComponent } from './components/dashboard/my-employers/my-employers.component';
import { PlannerComponent } from './components/dashboard/planner/planner.component';
import { InfoBoxesComponent } from './components/dashboard/info-boxes/info-boxes.component';
//import {ProgressBarModule} from "ngx-progress-bar";
import { ProgressbarModule } from 'ngx-bootstrap';
import { IntroductionComponent } from './components/dashboard/introduction/introduction.component';//import { TooltipModule } from 'angular2-tooltips';
export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    IndexComponent,
    MapComponent,
    TopnavComponent,
    SidebarComponent,
    AdminComponent,
    AdminTopnavComponent,
    AdminSidebarComponent,
    BillingPlanComponent,
    nvD3,
    Tabs,
    //Tab,
    WeatherComponent,
    AdminUsersComponent,
    UnautorizedComponent,
    AdminOwnerRequestsComponent,
    HomeComponent,
    UserProfileComponent,
    ControlSidebarComponent,
    PlantagesComponent,
    PlantageWidgetComponent,
    WeatherWidgetComponent,
    WorkRequestsComponent,
    FindWorkComponent,
    MyEmployeesComponent,
    JobOffersComponent,
    JobRequestsComponent,
    MapWidgetComponent,
    //PrecipGraphComponent,
    PrecipProbGraphComponent,
    WindComponent,
    NotificationsComponent,
    MeasurersComponent,
    RulesComponent,
    WeatherPlantageComponent,
    GoogleChartComponent,
    PlantsComponent,
    MyEmployersComponent,
    PlannerComponent,
    InfoBoxesComponent,
    IntroductionComponent
    //GraphComponent,
    //ClimateChartComponent
  ],
  imports: [
    Ng2PageScrollModule.forRoot(),
    BrowserModule,
    MyDatePickerModule,
    FormsModule,
    SelectModule,
    ReactiveFormsModule,
    HttpModule,
    PopoverModule,
    AppRouting,
    NgxChartsModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    }),
    FlashMessagesModule,
    ModalModule,
    DataTableModule,
    SwiperModule,
    NguiMapModule.forRoot({ apiUrl: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCmNXuFkXbjQdl4djaMshrbw6tTXU54jaI&libraries=drawing,geometry' }),
    ToastyModule.forRoot(),
    NgsRevealModule.forRoot(),
    NouisliderModule,
    TabsModule,
    ProgressbarModule.forRoot()
    // TooltipModule
  ],
  providers: [AuthService, WeatherService, MapService, NotificationService],
  bootstrap: [AppComponent],
})
export class AppModule { }
