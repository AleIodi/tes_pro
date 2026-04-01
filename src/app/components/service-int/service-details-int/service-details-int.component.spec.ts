import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDetailsIntComponent } from './service-details-int.component';

describe('ServiceDetailsIntComponent', () => {
  let component: ServiceDetailsIntComponent;
  let fixture: ComponentFixture<ServiceDetailsIntComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceDetailsIntComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceDetailsIntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
