import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExtraIntFormComponent } from './service-extra-int-form.component';

describe('ServiceExtraIntFormComponent', () => {
  let component: ServiceExtraIntFormComponent;
  let fixture: ComponentFixture<ServiceExtraIntFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceExtraIntFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceExtraIntFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
