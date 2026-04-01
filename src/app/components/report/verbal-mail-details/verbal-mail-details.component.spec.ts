import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalMailDetailsComponent } from './verbal-mail-details.component';

describe('VerbalMailDetailsComponent', () => {
  let component: VerbalMailDetailsComponent;
  let fixture: ComponentFixture<VerbalMailDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalMailDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalMailDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
