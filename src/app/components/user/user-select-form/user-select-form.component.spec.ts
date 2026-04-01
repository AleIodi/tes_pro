import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSelectFormComponent } from './user-select-form.component';

describe('UserSelectFormComponent', () => {
  let component: UserSelectFormComponent;
  let fixture: ComponentFixture<UserSelectFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSelectFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSelectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
