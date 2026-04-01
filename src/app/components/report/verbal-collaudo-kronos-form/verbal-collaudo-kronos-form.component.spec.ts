import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoKronosFormComponent } from './verbal-collaudo-kronos-form.component';

describe('VerbalCollaudoKronosFormComponent', () => {
  let component: VerbalCollaudoKronosFormComponent;
  let fixture: ComponentFixture<VerbalCollaudoKronosFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoKronosFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoKronosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
