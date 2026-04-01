import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarServiceOperationEventComponent } from './calendar-service-operation-event.component';

describe('CalendarServiceOperationEventComponent', () => {
  let component: CalendarServiceOperationEventComponent;
  let fixture: ComponentFixture<CalendarServiceOperationEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarServiceOperationEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarServiceOperationEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
