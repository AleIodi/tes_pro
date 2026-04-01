import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTaskReportMailExtListComponent } from './service-task-report-mail-ext-list.component';

describe('ServiceTaskReportMailExtListComponent', () => {
  let component: ServiceTaskReportMailExtListComponent;
  let fixture: ComponentFixture<ServiceTaskReportMailExtListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceTaskReportMailExtListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTaskReportMailExtListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
