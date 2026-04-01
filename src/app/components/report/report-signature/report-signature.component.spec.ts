import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSignatureComponent } from './report-signature.component';

describe('ReportSignatureComponent', () => {
  let component: ReportSignatureComponent;
  let fixture: ComponentFixture<ReportSignatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportSignatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
