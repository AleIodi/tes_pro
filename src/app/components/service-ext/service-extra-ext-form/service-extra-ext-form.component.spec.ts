import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExtraExtFormComponent } from './service-extra-ext-form.component';

describe('ServiceExtraFormComponent', () => {
  let component: ServiceExtraExtFormComponent;
  let fixture: ComponentFixture<ServiceExtraExtFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceExtraExtFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceExtraExtFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
