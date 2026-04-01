import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartMontlyHoursComponent } from './chart-montly-hours.component';

describe('ChartMontlyHoursComponent', () => {
  let component: ChartMontlyHoursComponent;
  let fixture: ComponentFixture<ChartMontlyHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartMontlyHoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartMontlyHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
