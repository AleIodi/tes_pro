import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalReportPublicComponent } from './verbal-report-public.component';

describe('VerbalReportPublicComponent', () => {
  let component: VerbalReportPublicComponent;
  let fixture: ComponentFixture<VerbalReportPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalReportPublicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalReportPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
