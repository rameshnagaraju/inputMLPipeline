import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstloginUserComponent } from './firstlogin-user.component';

describe('FirstloginUserComponent', () => {
  let component: FirstloginUserComponent;
  let fixture: ComponentFixture<FirstloginUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstloginUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstloginUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
