import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoAlcioneFormComponent } from './verbal-collaudo-alcione-form.component';

describe('VerbalCollaudoAlcioneFormComponent', () => {
  let component: VerbalCollaudoAlcioneFormComponent;
  let fixture: ComponentFixture<VerbalCollaudoAlcioneFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoAlcioneFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoAlcioneFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
