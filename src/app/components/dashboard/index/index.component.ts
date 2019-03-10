import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MapService } from '../../../services/map.service';
import { PlantageWidgetComponent } from '../plantages/plantage-widget/plantage-widget.component';
import { WeatherWidgetComponent } from '../weather/weather-widget/weather-widget.component';
import { MapWidgetComponent } from '../map/map-widget/map-widget.component';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  constructor(private router: Router) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);
  }

  ngOnInit() {

  }

}
