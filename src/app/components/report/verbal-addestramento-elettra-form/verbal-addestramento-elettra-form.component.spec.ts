import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoElettraFormComponent } from './verbal-addestramento-elettra-form.component';

describe('VerbalAddestramentoElettraFormComponent', () => {
  let component: VerbalAddestramentoElettraFormComponent;
  let fixture: ComponentFixture<VerbalAddestramentoElettraFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoElettraFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoElettraFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
