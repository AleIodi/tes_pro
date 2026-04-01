import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartJobHoursComponent } from './chart-job-hours.component';

describe('ChartJobHoursComponent', () => {
  let component: ChartJobHoursComponent;
  let fixture: ComponentFixture<ChartJobHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartJobHoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartJobHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
