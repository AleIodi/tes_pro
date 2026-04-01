import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTripExtListComponent } from './service-trip-ext-list.component';

describe('ServiceTripExtListComponent', () => {
  let component: ServiceTripExtListComponent;
  let fixture: ComponentFixture<ServiceTripExtListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceTripExtListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTripExtListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
