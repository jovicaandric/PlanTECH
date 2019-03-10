import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantagesComponent } from './plantages.component';

describe('PlantagesComponent', () => {
  let component: PlantagesComponent;
  let fixture: ComponentFixture<PlantagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
