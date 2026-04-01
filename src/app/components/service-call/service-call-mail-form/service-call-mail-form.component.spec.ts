import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCallMailFormComponent } from './service-call-mail-form.component';

describe('ServiceCallMailFormComponent', () => {
  let component: ServiceCallMailFormComponent;
  let fixture: ComponentFixture<ServiceCallMailFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceCallMailFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCallMailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
