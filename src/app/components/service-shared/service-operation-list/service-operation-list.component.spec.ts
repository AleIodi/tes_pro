import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOperationListComponent } from './service-operation-list.component';

describe('ServiceOperationListComponent', () => {
  let component: ServiceOperationListComponent;
  let fixture: ComponentFixture<ServiceOperationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceOperationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOperationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
