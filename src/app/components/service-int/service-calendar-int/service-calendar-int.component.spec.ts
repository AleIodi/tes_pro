import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCalendarIntComponent } from './service-calendar-int.component';

describe('ServiceCalendarIntComponent', () => {
  let component: ServiceCalendarIntComponent;
  let fixture: ComponentFixture<ServiceCalendarIntComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceCalendarIntComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCalendarIntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
