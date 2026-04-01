import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalCollaudoMaiaFormComponent } from './verbal-collaudo-maia-form.component';

describe('VerbalCollaudoMaiaFormComponent', () => {
  let component: VerbalCollaudoMaiaFormComponent;
  let fixture: ComponentFixture<VerbalCollaudoMaiaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalCollaudoMaiaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalCollaudoMaiaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
