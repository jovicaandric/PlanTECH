export class WeatherModel {

    public temperature: number;
    public date: Date;
    public time: Date;
    public summary: String;
    public icon: String;
    public temperatureMin: number;
    public precipProbability;
    public temperatureMax;
    public windSpeed;
    public humidity;
    public pressure;
    public cloudCover;
    public visibility;
    public windBearing;

    constructor(temperature: number, time: Date, summary: String, icon:String,
     temperatureMin: number, precipP: number, temperatureMax: number, windSpeed: number, humidity: number,
     pressure: number, cloudCover: number, visibility: number, windBearing: number) {
        this.temperature = temperature;
        this.time = time;
        this.summary = summary;
        this.icon = icon;
        this.temperatureMin = temperatureMin;
        this.precipProbability = precipP;
        this.temperatureMax = temperatureMax;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
        this.cloudCover = cloudCover;
        this.visibility = visibility;
        this.pressure = pressure;
        this.windBearing = windBearing;
    }
}