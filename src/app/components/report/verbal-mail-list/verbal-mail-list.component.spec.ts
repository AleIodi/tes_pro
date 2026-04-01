import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbalMailListComponent } from './verbal-mail-list.component';

describe('VerbalMailListComponent', () => {
  let component: VerbalMailListComponent;
  let fixture: ComponentFixture<VerbalMailListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbalMailListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbalMailListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
