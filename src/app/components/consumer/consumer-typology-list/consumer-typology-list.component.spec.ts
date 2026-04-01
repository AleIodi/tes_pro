import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumerTypologyListComponent } from './consumer-typology-list.component';

describe('ConsumerTypologyListComponent', () => {
  let component: ConsumerTypologyListComponent;
  let fixture: ComponentFixture<ConsumerTypologyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumerTypologyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumerTypologyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
