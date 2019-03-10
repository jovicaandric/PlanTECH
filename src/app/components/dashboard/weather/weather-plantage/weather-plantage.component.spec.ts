import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherPlantageComponent } from './weather-plantage.component';

describe('WeatherPlantageComponent', () => {
  let component: WeatherPlantageComponent;
  let fixture: ComponentFixture<WeatherPlantageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeatherPlantageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherPlantageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
