import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEmployersComponent } from './my-employers.component';

describe('MyEmployersComponent', () => {
  let component: MyEmployersComponent;
  let fixture: ComponentFixture<MyEmployersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyEmployersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyEmployersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
