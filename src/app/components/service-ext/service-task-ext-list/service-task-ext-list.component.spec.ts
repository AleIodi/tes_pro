import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTaskExtListComponent } from './service-task-ext-list.component';

describe('ServiceTaskExtListComponent', () => {
  let component: ServiceTaskExtListComponent;
  let fixture: ComponentFixture<ServiceTaskExtListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceTaskExtListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTaskExtListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
