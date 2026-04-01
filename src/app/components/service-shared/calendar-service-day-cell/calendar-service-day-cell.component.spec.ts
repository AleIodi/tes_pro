import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarServiceDayCellComponent } from './calendar-service-day-cell.component';

describe('CalendarServiceDayCellComponent', () => {
  let component: CalendarServiceDayCellComponent;
  let fixture: ComponentFixture<CalendarServiceDayCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarServiceDayCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarServiceDayCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
