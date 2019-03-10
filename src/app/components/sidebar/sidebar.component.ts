import { Component, OnInit, Input } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { MapService } from '../../services/map.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

declare var require: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  @Input() user: any;
  // @Input() socket: any;
  jobOffers: any;
  jobRequests: any;
  plantages: any;
  myEmployees: any[] = [];
  isOwner: any;
  hasPlantages: any;
  //socket = null;
  max = 0;
  current = 0;
  billingId = 0;
  userAvatar: any;
  isRuler: any;

  constructor(
    private authService: AuthService,
    private mapService: MapService,
    private router: Router) {

    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);

    this.user = JSON.parse(localStorage.getItem('user'));

  }

  ngOnInit() {
    if (this.user != null) {
      // this.authService.getUserProgress(this.user).subscribe(data => {
      //   let temp = JSON.parse(data.progress);
      //   temp.forEach(element => {
      //     this.max = element["max"],
      //       this.current = element["currentPlant"],
      //       this.billingId = element["billingId"]
      //   });

      //   console.log(this.max + '/' + this.current);
      // }); 

      this.checkIfOwner();
      this.getPlantages();
      this.getProgress();
      this.checkIfRuler();
    }
    this.userImage();
  }

  getProgress() {
    this.authService.getUserProgress(this.user).subscribe(data => {
      let temp = JSON.parse(data.progress);
      temp.forEach(element => {
        this.max = element["max"],
          this.current = element["currentPlant"],
          this.billingId = element["billingId"]
      });
    });
  }

  getPlantages() {
    this.mapService.getPlantages().subscribe(data => {
      if (data.plantages.length === 0)
        this.hasPlantages = false;
      else
        this.hasPlantages = true;

    });
  }

  checkIfOwner() {
    this.authService.checkIfOwner(this.user.Id).subscribe(data => {
      this.isOwner = data;
    });
  }

  checkIfRuler() {
    this.authService.checkIfRuler(this.user.Id).subscribe(data => {
      this.isRuler = data;
    });
  }

  getJobOffers() {
    this.authService.getJobOffers(this.user.Id).subscribe(data => {
      this.jobOffers = JSON.parse(data.offers);
    });
  }
  getJobRequests() {
    this.authService.getJobRequests(this.user.Id).subscribe(data => {
      this.jobRequests = JSON.parse(data.offers);
    });
  }
  // getEmployees() {
  //   this.authService.getThisUserPlantages(this.user).subscribe(data => {
  //     this.myEmployees = JSON.parse(data.users);
  //   });
  // }

  upgradePlan() {
    this.authService.checkUpgrade(this.user.Id).subscribe(data => {
      if (!data) {
        var bill = this.billingId + 1;
        var dataToSend: any = ({
          userId: this.user.Id,
          billingPlan: bill,
        });

        this.authService.upgradePlan(dataToSend).subscribe(data => {
          if (data.success) {
            swal({
              title: 'Uspešno ste unapredili svoj plan',
              text: 'Sačekajte da Vas admin odobri',
              type: 'success'
            });
            this.getProgress();
          }
          else {
            swal({
              title: 'Oops...',
              text: 'Something went wrong.',
              //type: 'error'
            });
          }
        });
      }
      else {
        swal({
          title: 'Već ste zahtevali poboljšanje paketa',
          text: 'Molimo Vas sačekajte da admin odobri Vaš zahtev',
          type: 'warning'
        });
      }
    });
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
  private profile = location.protocol + "//" + window.location.hostname + ':2047/userImages/user.png';
}
