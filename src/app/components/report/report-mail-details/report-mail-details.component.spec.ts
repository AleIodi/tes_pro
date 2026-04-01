import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMailDetailsComponent } from './report-mail-details.component';

describe('ReportMailDetailsComponent', () => {
  let component: ReportMailDetailsComponent;
  let fixture: ComponentFixture<ReportMailDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportMailDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportMailDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
