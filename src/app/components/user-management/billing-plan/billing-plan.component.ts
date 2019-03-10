import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-billing-plan',
  templateUrl: './billing-plan.component.html',
  styleUrls: ['./billing-plan.component.css']
})
export class BillingPlanComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  formLogin(x) {
	  if(x === 1) {
		 // biling plan basic
	  }
	  else if(x === 2) {
		 // biling plan standard
	  }
	  else if(x === 3) {
		 // biling plan premium
	  }
	  else if(x === 4) {
		 // biling plan free
	  }
  }
  
}
