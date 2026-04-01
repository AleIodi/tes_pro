import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncListComponent } from './sync-list.component';

describe('SyncListComponent', () => {
  let component: SyncListComponent;
  let fixture: ComponentFixture<SyncListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
