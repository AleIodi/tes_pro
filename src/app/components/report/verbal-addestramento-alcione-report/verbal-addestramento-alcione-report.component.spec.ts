import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoAlcioneReportComponent } from './verbal-addestramento-alcione-report.component';

describe('VerbalAddestramentoAlcioneReportComponent', () => {
  let component: VerbalAddestramentoAlcioneReportComponent;
  let fixture: ComponentFixture<VerbalAddestramentoAlcioneReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoAlcioneReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoAlcioneReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
