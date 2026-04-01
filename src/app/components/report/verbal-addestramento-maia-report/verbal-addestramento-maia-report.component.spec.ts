import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoMaiaReportComponent } from './verbal-addestramento-maia-report.component';

describe('VerbalAddestramentoMaiaReportComponent', () => {
  let component: VerbalAddestramentoMaiaReportComponent;
  let fixture: ComponentFixture<VerbalAddestramentoMaiaReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoMaiaReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoMaiaReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
