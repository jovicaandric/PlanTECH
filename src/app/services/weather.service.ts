import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { WeatherModel } from '../components/dashboard/weather//weather.model';
import { URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class WeatherService {


  constructor(private http: Http) { }
  result: Array<WeatherModel>;
  latitude;
  longitude;

  getWeatherFromServer(latitude: string, longitude: string): Observable<any> {

    this.latitude = latitude;
    this.longitude = longitude;
    var resultMy: Array<WeatherModel> = [];

    var coordinates: any = {
      "longitude": longitude,
      "latitude": latitude
    }
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlAddress = "/weather/getWeather";

    return this.http.post(urlAddress, coordinates, { headers: headers })
      .map((result: Response) => result.json())
      .map((tasks: Array<WeatherModel>) => {
        tasks.forEach((task) => {
          resultMy.push(new WeatherModel(task.temperature, task.time, task.summary, task.icon, 0, 
          task.precipProbability, 0, task.windSpeed, task.humidity,  task.pressure, task.cloudCover, task.visibility, task.windBearing));
        }
        );
        return resultMy;
      });
  }

  getDaily(latitude: string, longitude: string): Observable<any> {

    this.latitude = latitude;
    this.longitude = longitude;
    var resultMy: Array<WeatherModel> = [];

    var coordinates: any = {
      "longitude": longitude,
      "latitude": latitude
    }
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlAddress = "/weather/getDaily";

    return this.http.post(urlAddress, coordinates, { headers: headers })
      .map((result: Response) => result.json())
      .map((tasks: Array<WeatherModel>) => {
        tasks.forEach((task) => {
          resultMy.push(new WeatherModel(0, task.time, task.summary, task.icon, task.temperatureMin, task.precipProbability,
           task.temperatureMax, task.windSpeed, task.humidity, 0,0,task.visibility, task.windBearing));
        }
        );
        return resultMy;
      });
  }


  

}


