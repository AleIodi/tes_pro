import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartReportStatusComponent } from './chart-report-status.component';

describe('ChartReportStatusComponent', () => {
  let component: ChartReportStatusComponent;
  let fixture: ComponentFixture<ChartReportStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartReportStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartReportStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
