import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';

declare var require: any;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  public notifications: any = [];
  public user: any;
  public tempNotification: any;
  public stil = 'bg-red';

  constructor(private notificationService: NotificationService, private router: Router) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);

    this.user = JSON.parse(localStorage.getItem('user'));
  }

  ngOnInit() {
    this.getNotifications();
  }

  toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t.getDate() + "." + (t.getMonth() + 1) + "." + t.getFullYear();
  }
  toHour(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return (t.getHours() + 2) + ":" + t.getMinutes();
  }

  public currentDate: any;

  changeDate(date: any): boolean {
    if (this.currentDate == date)
      return true;
    else {
      this.currentDate = date;
      return false;
    }
  }

  getYear(secs) {
    var t = new Date(1970, 0, 1);
    t.setSeconds(secs);
    return t.getFullYear();
  }

  getNotifications() {
    this.notifications.length = 0;
    this.notificationService.getNotifications(this.user.Id).subscribe(data => {
      let nots: any = JSON.parse(data.notifications);
      nots.forEach(not => {
        this.tempNotification = {
          id: not["Id"],
          title: not["Title"],
          description: not["Description"],
          to: not["Receiver"],
          plantageId: not["PlantageId"],
          date: this.toDateTime(not["NotificationDate"] / 1000),
          hour: this.toHour(not["NotificationDate"] / 1000),
          seen: not["Seen"],
          type: not["Type"],
          stil: this.getYear(not["NotificationDate"] / 1000),
        }
        console.log('godina ' + this.tempNotification.stil);
        switch (this.tempNotification.stil % 4) {
          case 0: {
            this.tempNotification.stil = 'bg-red';
            break;
          }
          case 1: {
            this.tempNotification.stil = 'bg-blue';
            break;
          }
          case 2: {
            this.tempNotification.stil = 'bg-green';
            break;
          }
          case 3: {
            this.tempNotification.stil = 'bg-yellow';
            break;
          }
        }
        this.notifications.push(this.tempNotification);
      });
    });
  }

  private cut = require("../../../../assets/dist/img/icons/scissors-1.png");
  private job = require("../../../../assets/dist/img/icons/certificate.png");
  private watering = require("../../../../assets/dist/img/icons/watering-can.png");
  private fertilize = require("../../../../assets/dist/img/icons/fertilizer.png");
  private harvest = require("../../../../assets/dist/img/icons/harvest-1.png");
  private rain = require("../../../../assets/dist/img/icons/rain.png");
  private accept = require("../../../../assets/dist/img/icons/check.png");
  private reject = require("../../../../assets/dist/img/icons/reject.png");
  private billing = require("../../../../assets/dist/img/icons/billing.png");
  private rule = require("../../../../assets/dist/img/icons/rule.png");
}
