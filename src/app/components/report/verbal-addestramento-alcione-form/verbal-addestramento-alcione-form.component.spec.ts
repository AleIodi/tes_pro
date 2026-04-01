import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoAlcioneFormComponent } from './verbal-addestramento-alcione-form.component';

describe('VerbalAddestramentoAlcioneFormComponent', () => {
  let component: VerbalAddestramentoAlcioneFormComponent;
  let fixture: ComponentFixture<VerbalAddestramentoAlcioneFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoAlcioneFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoAlcioneFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
