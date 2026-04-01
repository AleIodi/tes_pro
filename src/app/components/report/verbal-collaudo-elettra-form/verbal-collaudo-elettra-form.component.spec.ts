import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoElettraFormComponent } from './verbal-collaudo-elettra-form.component';

describe('VerbalCollaudoElettraFormComponent', () => {
  let component: VerbalCollaudoElettraFormComponent;
  let fixture: ComponentFixture<VerbalCollaudoElettraFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoElettraFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoElettraFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
