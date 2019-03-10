import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-unautorized',
  templateUrl: './unautorized.component.html',
  styleUrls: ['./unautorized.component.css']
})
export class UnautorizedComponent implements OnInit {

  private user: any;

  constructor() {
    this.user = JSON.parse(localStorage.getItem('user'));
   }

  ngOnInit() {

  }

}
