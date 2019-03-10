import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantageWidgetComponent } from './plantage-widget.component';

describe('PlantageWidgetComponent', () => {
  let component: PlantageWidgetComponent;
  let fixture: ComponentFixture<PlantageWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantageWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantageWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
