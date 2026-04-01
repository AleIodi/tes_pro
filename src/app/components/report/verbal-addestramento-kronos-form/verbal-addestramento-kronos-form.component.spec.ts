import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoKronosFormComponent } from './verbal-addestramento-kronos-form.component';

describe('VerbalAddestramentoKronosFormComponent', () => {
  let component: VerbalAddestramentoKronosFormComponent;
  let fixture: ComponentFixture<VerbalAddestramentoKronosFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoKronosFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoKronosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
