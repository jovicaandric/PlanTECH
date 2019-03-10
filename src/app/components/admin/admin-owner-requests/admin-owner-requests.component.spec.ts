import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOwnerRequestsComponent } from './admin-owner-requests.component';

describe('AdminOwnerRequestsComponent', () => {
  let component: AdminOwnerRequestsComponent;
  let fixture: ComponentFixture<AdminOwnerRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminOwnerRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminOwnerRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
