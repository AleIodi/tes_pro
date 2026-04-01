import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExtraListComponent } from './service-extra-list.component';

describe('ServiceExtraListComponent', () => {
  let component: ServiceExtraListComponent;
  let fixture: ComponentFixture<ServiceExtraListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceExtraListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceExtraListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
