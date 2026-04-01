import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalFormComponent } from './verbal-form.component';

describe('VerbalFormComponent', () => {
  let component: VerbalFormComponent;
  let fixture: ComponentFixture<VerbalFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
