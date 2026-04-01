import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExtraIntListComponent } from './service-extra-int-list.component';

describe('ServiceExtraIntListComponent', () => {
  let component: ServiceExtraIntListComponent;
  let fixture: ComponentFixture<ServiceExtraIntListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceExtraIntListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceExtraIntListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
