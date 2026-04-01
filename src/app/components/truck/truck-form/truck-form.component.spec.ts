import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckFormComponent } from './truck-form.component';

describe('TruckFormComponent', () => {
  let component: TruckFormComponent;
  let fixture: ComponentFixture<TruckFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TruckFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});