import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTripExtFormComponent } from './service-trip-ext-form.component';

describe('ServiceTripExtFormComponent', () => {
  let component: ServiceTripExtFormComponent;
  let fixture: ComponentFixture<ServiceTripExtFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceTripExtFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTripExtFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
