import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckStockListComponent } from './truck-stock-list.component';

describe('TruckStockListComponent', () => {
  let component: TruckStockListComponent;
  let fixture: ComponentFixture<TruckStockListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TruckStockListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckStockListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});