import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

@Injectable()
export class NotificationService {

  constructor(private http: Http) { 
  }

  getNotifications(userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/notifications/getNotifications', { id: userId }, { headers: headers }).map(res => res.json());
  }

  updateNotifications(userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/notifications/updateNotifications', { id: userId }, { headers: headers }).map(res => res.json());
  }
/*
  updateNotificationsType(userId) {
    console.log('type servis ' + userId);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/notifications/updateNotificationsType', { id: userId }, { headers: headers }).map(res => res.json());
  }*/
}
