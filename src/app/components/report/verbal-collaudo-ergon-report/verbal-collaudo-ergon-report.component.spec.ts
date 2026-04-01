import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoErgonReportComponent } from './verbal-collaudo-ergon-report.component';

describe('VerbalCollaudoErgonReportComponent', () => {
  let component: VerbalCollaudoErgonReportComponent;
  let fixture: ComponentFixture<VerbalCollaudoErgonReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoErgonReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoErgonReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
