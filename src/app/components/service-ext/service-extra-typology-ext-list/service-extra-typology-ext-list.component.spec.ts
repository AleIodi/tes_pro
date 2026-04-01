import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExtraTypologyExtListComponent } from './service-extra-typology-ext-list.component';

describe('ServiceExtraTypologyExtListComponent', () => {
  let component: ServiceExtraTypologyExtListComponent;
  let fixture: ComponentFixture<ServiceExtraTypologyExtListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceExtraTypologyExtListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceExtraTypologyExtListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
