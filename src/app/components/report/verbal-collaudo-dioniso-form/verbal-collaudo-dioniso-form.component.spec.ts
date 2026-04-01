import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoDionisoFormComponent } from './verbal-collaudo-dioniso-form.component';

describe('VerbalCollaudoDionisoFormComponent', () => {
  let component: VerbalCollaudoDionisoFormComponent;
  let fixture: ComponentFixture<VerbalCollaudoDionisoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoDionisoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoDionisoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
