import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecipProbGraphComponent } from './precip-prob-graph.component';

describe('PrecipProbGraphComponent', () => {
  let component: PrecipProbGraphComponent;
  let fixture: ComponentFixture<PrecipProbGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrecipProbGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecipProbGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
