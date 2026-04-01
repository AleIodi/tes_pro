import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCallSelectFormComponent } from './service-call-select-form.component';

describe('ServiceCallSelectFormComponent', () => {
  let component: ServiceCallSelectFormComponent;
  let fixture: ComponentFixture<ServiceCallSelectFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceCallSelectFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCallSelectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
