import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalAddestramentoDionisoFormComponent } from './verbal-addestramento-dioniso-form.component';

describe('VerbalAddestramentoDionisoFormComponent', () => {
  let component: VerbalAddestramentoDionisoFormComponent;
  let fixture: ComponentFixture<VerbalAddestramentoDionisoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalAddestramentoDionisoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalAddestramentoDionisoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
