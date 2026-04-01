import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOperationIntListComponent } from './service-operation-int-list.component';

describe('ServiceOperationIntListComponent', () => {
  let component: ServiceOperationIntListComponent;
  let fixture: ComponentFixture<ServiceOperationIntListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceOperationIntListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOperationIntListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
