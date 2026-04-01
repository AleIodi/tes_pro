import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoErgonFormComponent } from './verbal-addestramento-ergon-form.component';

describe('VerbalAddestramentoErgonFormComponent', () => {
  let component: VerbalAddestramentoErgonFormComponent;
  let fixture: ComponentFixture<VerbalAddestramentoErgonFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoErgonFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoErgonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
