import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoMaiaReportComponent } from './verbal-collaudo-maia-report.component';

describe('VerbalCollaudoMaiaReportComponent', () => {
  let component: VerbalCollaudoMaiaReportComponent;
  let fixture: ComponentFixture<VerbalCollaudoMaiaReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoMaiaReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoMaiaReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
