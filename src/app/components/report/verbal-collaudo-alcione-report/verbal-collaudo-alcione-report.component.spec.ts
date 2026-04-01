import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoAlcioneReportComponent } from './verbal-collaudo-alcione-report.component';

describe('VerbalCollaudoAlcioneReportComponent', () => {
  let component: VerbalCollaudoAlcioneReportComponent;
  let fixture: ComponentFixture<VerbalCollaudoAlcioneReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoAlcioneReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoAlcioneReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
