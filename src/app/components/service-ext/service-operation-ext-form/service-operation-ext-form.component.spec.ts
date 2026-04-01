import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOperationExtFormComponent } from './service-operation-ext-form.component';

describe('ServiceOperationExtFormComponent', () => {
  let component: ServiceOperationExtFormComponent;
  let fixture: ComponentFixture<ServiceOperationExtFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceOperationExtFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOperationExtFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
