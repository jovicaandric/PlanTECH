import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from 'ng2-translate';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { NotificationService } from '../../services/notification.service';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import * as io from "socket.io-client";
import { PopoverModule } from "ngx-popover";

declare var require: any;

@Component({
  selector: 'app-topnav',
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.css']
})
export class TopnavComponent implements OnInit {
  public user: any;
  private languageInCookie;
  public notifications: any = [];
  public toastyDo: any = [];
  private tempNotification: any;
  public unseenNotif: number = 0;
  socket = null;
  userAvatar: any;

  constructor(private translateService: TranslateService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private toastyService: ToastyService, private toastyConfig: ToastyConfig
  ) {
    //window.location.reload();
    this.languageInCookie = Cookie.get("language");
    if (this.languageInCookie == "") {
      Cookie.set("language", 'en', 30);
      this.languageInCookie = 'en';
    }
    translateService.addLangs(['en', 'srb']);
    translateService.setDefaultLang(this.languageInCookie);
    translateService.use(this.languageInCookie);
    this.user = JSON.parse(localStorage.getItem('user'));

    this.toastyConfig.theme = 'default';
    this.toastyConfig.position = "bottom-right";

  }

  changeLang(lang: string) {
    this.translateService.use(lang);
    Cookie.delete("language");
    Cookie.set("language", lang, 30);
    this.languageInCookie = lang;
  }

  reload() {
    location.reload();
  }


  userImage() {
    this.authService.getImage(this.user.Id).subscribe(data => {
      let image = JSON.parse(data.image);
      if (image[0].Image)
        this.userAvatar = location.protocol + "//" + window.location.hostname + ':2047/userImages/' + image[0].Image;
      else
        this.userAvatar = location.protocol + "//" + window.location.hostname + ':2047/userImages/user.png';
    });
  }
  ngOnInit() {

    this.changeLang(this.languageInCookie);
    this.getNotifications();
    // setInterval(() => {
    //    this.getNotifications();
    //  }, 10000);
    this.socket = io(window.location.hostname + ":2047");
    this.socket.emit('join', this.user);
    this.socket.on('addedNotif', (not) => {
      //this.getNotifications();
      this.tempNotification = {
        id: not["Id"],
        title: not["Title"],
        description: not["Description"],
        shortDesc: '',
        to: not["Receiver"],
        plantageId: not["PlantageId"],
        date: this.toDateTime(not["NotificationDate"] / 1000),
        hour: this.toHour(not["NotificationDate"] / 1000),
        seen: 0,
        type: not["Type"],
        //new: not["New"]
      }
      if (this.tempNotification.description != null && this.tempNotification.description.length >= 40)
        this.tempNotification.shortDesc = this.tempNotification.description.substring(0, 35) + '...';
      else
        this.tempNotification.shortDesc = this.tempNotification.description;
      //console.log('ovde' + this.tempNotification.shortDesc);
      if (this.tempNotification.seen == 0) {
        this.unseenNotif++;
        //console.log(this.checkToasty(this.tempNotification));
        if (this.checkToasty(this.tempNotification) == false) {
          this.toastyService.default({
            title: this.tempNotification.title,
            msg: this.tempNotification.description,
            showClose: true,
            timeout: 5000,
            theme: "default"
          });
          this.toastyDo.push(this.tempNotification);
          this.playAudio();
        }
      }
      //console.log(this.tempNotification.type);
      this.notifications.unshift(this.tempNotification);
    });
    this.userImage();
  }

  onLogOut() {
    this.socket.disconnect();
    this.authService.logout();
  }

  toHour(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return (t.getHours() + 2) + ":" + t.getMinutes();
  }

  toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t.getDate() + "." + (t.getMonth() + 1) + "." + t.getFullYear();
  }


  getNotifications() {
    this.unseenNotif = 0;
    this.notifications.length = 0;
    this.notificationService.getNotifications(this.user.Id).subscribe(data => {
      let nots: any = JSON.parse(data.notifications);
      nots.forEach(not => {
        this.tempNotification = {
          id: not["Id"],
          title: not["Title"],
          description: not["Description"],
          shortDesc: '',
          to: not["Receiver"],
          plantageId: not["PlantageId"],
          date: this.toDateTime(not["NotificationDate"] / 1000),
          hour: this.toHour(not["NotificationDate"] / 1000),
          seen: not["Seen"],
          type: not["Type"],
          //new: not["New"]
        }
        if (this.tempNotification.description != null && this.tempNotification.description.length >= 40)
          this.tempNotification.shortDesc = this.tempNotification.description.substring(0, 35) + '...';
        else
          this.tempNotification.shortDesc = this.tempNotification.description;
        //console.log('ovde' + this.tempNotification.shortDesc);
        if (this.tempNotification.seen == 0) {
          this.unseenNotif++;
          //console.log(this.checkToasty(this.tempNotification));
          if (this.checkToasty(this.tempNotification) == false) {
            this.toastyService.default({
              title: this.tempNotification.title,
              msg: this.tempNotification.description,
              showClose: true,
              timeout: 5000,
              theme: "default"
            });
            this.toastyDo.push(this.tempNotification);
            this.playAudio();
          }
        }
        //console.log(this.tempNotification.type);
        this.notifications.push(this.tempNotification);
        //this.notificationService.updateNotificationsType(this.user.Id);
      });
    });
  }
  playAudio() {
    var audio = new Audio();
    audio.src = "/assets/filling-your-inbox.mp3";
    audio.load();
    audio.play();
  }

  checkToasty(notif: any) {
    for (var i = 0; i < this.toastyDo.length; i++) {
      if (this.toastyDo[i].id == notif.id)
        return true;
    }
    return false;
  }

  updateNotifications() {
    this.toastyDo.length = 0;
    if (this.unseenNotif > 0) {
      this.notificationService.updateNotifications(this.user.Id).subscribe(data => {
        if (data.success) {
          for (var i = 0; i < this.notifications.length; i++) {
            setTimeout(function () {
              this.notifications[i].seen = 1;
            }, 3000);

          }
          this.unseenNotif = 0;
        }
        else {
          console.log(data.message);
        }
      });

    }
  }


  private profile = require("../../../assets/dist/img/user.png");
  private job = require("../../../assets/dist/img/icons/certificate.png");
  private watering = require("../../../assets/dist/img/icons/watering-can.png");
  private fertilize = require("../../../assets/dist/img/icons/fertilizer.png");
  private harvest = require("../../../assets/dist/img/icons/harvest-1.png");
  private rain = require("../../../assets/dist/img/icons/rain.png");
  private cut = require("../../../assets/dist/img/icons/scissors-1.png");
  private accept = require("../../../assets/dist/img/icons/check.png");
  private reject = require("../../../assets/dist/img/icons/reject.png");
  private billing = require("../../../assets/dist/img/icons/billing.png");
  private rule = require("../../../assets/dist/img/icons/rule.png");
}
