import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalListComponent } from './verbal-list.component';

describe('VerbalListComponent', () => {
  let component: VerbalListComponent;
  let fixture: ComponentFixture<VerbalListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
