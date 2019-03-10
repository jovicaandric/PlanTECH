import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private router: Router) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);
    else if (JSON.parse(localStorage.getItem('user')).Role != "Admin")
      this.router.navigate(['/unautorized']);
  }

  ngOnInit() {
  }

}
