import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExtraTypologyIntListComponent } from './service-extra-typology-int-list.component';

describe('ServiceExtraTypologyIntListComponent', () => {
  let component: ServiceExtraTypologyIntListComponent;
  let fixture: ComponentFixture<ServiceExtraTypologyIntListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceExtraTypologyIntListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceExtraTypologyIntListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
