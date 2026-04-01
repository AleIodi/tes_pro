import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarServiceTaskEventComponent } from './calendar-service-task-event.component';

describe('CalendarServiceTaskEventComponent', () => {
  let component: CalendarServiceTaskEventComponent;
  let fixture: ComponentFixture<CalendarServiceTaskEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarServiceTaskEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarServiceTaskEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
