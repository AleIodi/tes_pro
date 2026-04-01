import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoElettraReportComponent } from './verbal-addestramento-elettra-report.component';

describe('VerbalAddestramentoElettraReportComponent', () => {
  let component: VerbalAddestramentoElettraReportComponent;
  let fixture: ComponentFixture<VerbalAddestramentoElettraReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoElettraReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoElettraReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
