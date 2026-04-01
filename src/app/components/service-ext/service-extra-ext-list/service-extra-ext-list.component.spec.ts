import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExtraExtListComponent } from './service-extra-ext-list.component';

describe('ServiceExtraExtListComponent', () => {
  let component: ServiceExtraExtListComponent;
  let fixture: ComponentFixture<ServiceExtraExtListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceExtraExtListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceExtraExtListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
