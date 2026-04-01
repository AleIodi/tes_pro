import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTaskProductExtListComponent } from './service-task-product-ext-list.component';

describe('ServiceTaskProductExtListComponent', () => {
  let component: ServiceTaskProductExtListComponent;
  let fixture: ComponentFixture<ServiceTaskProductExtListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceTaskProductExtListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTaskProductExtListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
