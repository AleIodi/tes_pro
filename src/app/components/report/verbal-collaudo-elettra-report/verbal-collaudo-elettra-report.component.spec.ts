import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoElettraReportComponent } from './verbal-collaudo-elettra-report.component';

describe('VerbalCollaudoElettraReportComponent', () => {
  let component: VerbalCollaudoElettraReportComponent;
  let fixture: ComponentFixture<VerbalCollaudoElettraReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoElettraReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoElettraReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
