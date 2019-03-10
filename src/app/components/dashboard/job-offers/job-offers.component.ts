import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
@Component({
  selector: 'app-job-offers',
  templateUrl: './job-offers.component.html',
  styleUrls: ['./job-offers.component.css']
})
export class JobOffersComponent implements OnInit {
  private jobOffers: any = [];
  private user: any;
  constructor(private authService: AuthService) {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.getJobOffers();
  }

  ngOnInit() {
  }
  getJobOffers() {
    this.authService.getJobOffers(this.user.Id).subscribe(data => {
      console.log(data);
      this.jobOffers = JSON.parse(data.offers);
    });
  }
  acceptOffer(offerId) {
    this.authService.acceptOffer(offerId).subscribe();
    this.removeOffer(offerId);
  }
  refuseOffer(offerId) {
    this.authService.refuseOffer(offerId).subscribe();
    this.removeOffer(offerId);
  }

  removeOffer(id) {
    for (var i = 0; i < this.jobOffers.length; i++) {
      if (this.jobOffers[i].Id == id) {
        this.jobOffers.splice(i, 1);
        break;
      }
    }
  }
}
