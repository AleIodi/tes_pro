import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsListComponent } from './job-details-list.component';

describe('JobDetailsListComponent', () => {
  let component: JobDetailsListComponent;
  let fixture: ComponentFixture<JobDetailsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobDetailsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
