export class DayWeather {

    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    public day;
    public minTemperature;
    public maxTemperature: number;
    public summary;
    public temperature;

    setDay(day: Date) {
        
        var dayName = this.days[day.getDay()];
        this.day = dayName;//+ " " + day.getHours() + ":00";
    }

    setTemp(temp: number) {
        this.temperature = Math.round(temp);
    }

    getDay(day: Date) {
        
        var dayName = this.days[new Date(+day *1000).getDay()];
        this.day = dayName.substring(0, 3);
    }

    setMaxTemp(temp: number) {
        this.maxTemperature = Math.round(temp);
    }   
}