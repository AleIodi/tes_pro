import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartDailyHoursComponent } from './chart-daily-hours.component';

describe('ChartDailyHoursComponent', () => {
  let component: ChartDailyHoursComponent;
  let fixture: ComponentFixture<ChartDailyHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartDailyHoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartDailyHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
