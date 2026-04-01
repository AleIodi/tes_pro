import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCalendarExtComponent } from './service-calendar-ext.component';

describe('ServiceCalendarExtComponent', () => {
  let component: ServiceCalendarExtComponent;
  let fixture: ComponentFixture<ServiceCalendarExtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceCalendarExtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCalendarExtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
