import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarServiceTripEventComponent } from './calendar-service-trip-event.component';

describe('CalendarServiceTripEventComponent', () => {
  let component: CalendarServiceTripEventComponent;
  let fixture: ComponentFixture<CalendarServiceTripEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarServiceTripEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarServiceTripEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
