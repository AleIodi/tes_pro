import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsActionListComponent } from './job-details-action-list.component';

describe('JobDetailsActionListComponent', () => {
  let component: JobDetailsActionListComponent;
  let fixture: ComponentFixture<JobDetailsActionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobDetailsActionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsActionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
