import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurersComponent } from './measurers.component';

describe('MeasurersComponent', () => {
  let component: MeasurersComponent;
  let fixture: ComponentFixture<MeasurersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeasurersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasurersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
