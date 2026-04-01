import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoKronosReportComponent } from './verbal-collaudo-kronos-report.component';

describe('VerbalCollaudoKronosReportComponent', () => {
  let component: VerbalCollaudoKronosReportComponent;
  let fixture: ComponentFixture<VerbalCollaudoKronosReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoKronosReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoKronosReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
