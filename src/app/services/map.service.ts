import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class MapService {

  constructor(private http: Http) { }

  deletePlantage(id) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/plantage/delete', { plantageId: id }, { headers: headers }).map(res => res.json());
  }

  getPlantages() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var userid = {
      userId: JSON.parse(localStorage.getItem('user')).Id
    }
    return this.http.post('/plantage/foruser', userid, { headers: headers }).map(res => res.json());
  }
  getMeasurers(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/plantage/measurers', user, { headers: headers }).map(res => res.json());
  }

  getPlantCategories() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/plants/categories', {}, { headers: headers }).map(res => res.json());
  }
  getPlants(categoryId, userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/plants/allforcategory', { categoryId, userId }, { headers: headers }).map(res => res.json());
  }
  getSpecies(plantId, userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/plants/species', { plantId, userId }, { headers: headers }).map(res => res.json());
  }
  getSeedmanufacturer(specieId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/plants/seedmanufacturer', { specieId }, { headers: headers }).map(res => res.json())
  }

  editMeasurer(meas, plantages) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/measurers/edit', { "measurer": meas, "plantages": plantages }, { headers: headers }).map(res => res.json())
  }
  getMeasurementsForPlantage(plantageId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/measurementsForPlantage', { "plantageId": plantageId }, { headers: headers }).map(res => res.json())
  }
  checkAlerts(plantage) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/plantages/checkAlerts', { plantage }, { headers: headers }).map(res => res.json())
  }

}
