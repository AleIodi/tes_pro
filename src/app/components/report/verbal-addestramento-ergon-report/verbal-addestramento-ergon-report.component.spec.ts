import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoErgonReportComponent } from './verbal-addestramento-ergon-report.component';

describe('VerbalAddestramentoErgonReportComponent', () => {
  let component: VerbalAddestramentoErgonReportComponent;
  let fixture: ComponentFixture<VerbalAddestramentoErgonReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoErgonReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoErgonReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
