import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOperationIntFormComponent } from './service-operation-int-form.component';

describe('ServiceOperationIntFormComponent', () => {
  let component: ServiceOperationIntFormComponent;
  let fixture: ComponentFixture<ServiceOperationIntFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceOperationIntFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOperationIntFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
