import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoDionisoReportComponent } from './verbal-collaudo-dioniso-report.component';

describe('VerbalCollaudoDionisoReportComponent', () => {
  let component: VerbalCollaudoDionisoReportComponent;
  let fixture: ComponentFixture<VerbalCollaudoDionisoReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoDionisoReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoDionisoReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
