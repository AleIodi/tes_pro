import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoMaiaFormComponent } from './verbal-addestramento-maia-form.component';

describe('VerbalAddestramentoMaiaFormComponent', () => {
  let component: VerbalAddestramentoMaiaFormComponent;
  let fixture: ComponentFixture<VerbalAddestramentoMaiaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoMaiaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoMaiaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
