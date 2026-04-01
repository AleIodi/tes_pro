import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarServiceCallEventComponent } from './calendar-service-call-event.component';

describe('CalendarServiceCallEventComponent', () => {
  let component: CalendarServiceCallEventComponent;
  let fixture: ComponentFixture<CalendarServiceCallEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarServiceCallEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarServiceCallEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
