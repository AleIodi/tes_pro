import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoDionisoReportComponent } from './verbal-addestramento-dioniso-report.component';

describe('VerbalAddestramentoDionisoReportComponent', () => {
  let component: VerbalAddestramentoDionisoReportComponent;
  let fixture: ComponentFixture<VerbalAddestramentoDionisoReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoDionisoReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoDionisoReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
