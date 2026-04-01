import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOperationExtListComponent } from './service-operation-ext-list.component';

describe('ServiceOperationExtListComponent', () => {
  let component: ServiceOperationExtListComponent;
  let fixture: ComponentFixture<ServiceOperationExtListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceOperationExtListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOperationExtListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
