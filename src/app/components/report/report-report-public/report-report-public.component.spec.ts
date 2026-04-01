import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportReportPublicComponent } from './report-report-public.component';

describe('ReportReportPublicComponent', () => {
  let component: ReportReportPublicComponent;
  let fixture: ComponentFixture<ReportReportPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportReportPublicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportReportPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
