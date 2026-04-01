import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTaskProductExtFormComponent } from './service-task-product-ext-form.component';

describe('ServiceTaskProductExtFormComponent', () => {
  let component: ServiceTaskProductExtFormComponent;
  let fixture: ComponentFixture<ServiceTaskProductExtFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceTaskProductExtFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTaskProductExtFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
