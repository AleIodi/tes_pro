import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoErgonFormComponent } from './verbal-collaudo-ergon-form.component';

describe('VerbalCollaudoErgonFormComponent', () => {
  let component: VerbalCollaudoErgonFormComponent;
  let fixture: ComponentFixture<VerbalCollaudoErgonFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoErgonFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoErgonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
