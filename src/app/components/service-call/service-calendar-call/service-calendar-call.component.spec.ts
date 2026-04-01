import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCalendarCallComponent } from './service-calendar-call.component';

describe('ServiceCalendarCallComponent', () => {
  let component: ServiceCalendarCallComponent;
  let fixture: ComponentFixture<ServiceCalendarCallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceCalendarCallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCalendarCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
