import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnautorizedComponent } from './unautorized.component';

describe('UnautorizedComponent', () => {
  let component: UnautorizedComponent;
  let fixture: ComponentFixture<UnautorizedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnautorizedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnautorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
