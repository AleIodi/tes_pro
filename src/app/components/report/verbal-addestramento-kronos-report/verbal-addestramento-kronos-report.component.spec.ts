import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoKronosReportComponent } from './verbal-addestramento-kronos-report.component';

describe('VerbalAddestramentoKronosReportComponent', () => {
  let component: VerbalAddestramentoKronosReportComponent;
  let fixture: ComponentFixture<VerbalAddestramentoKronosReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoKronosReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoKronosReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
