import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTaskDetailsExtComponent } from './service-task-details-ext.component';

describe('ServiceTaskDetailsExtComponent', () => {
  let component: ServiceTaskDetailsExtComponent;
  let fixture: ComponentFixture<ServiceTaskDetailsExtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceTaskDetailsExtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTaskDetailsExtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
