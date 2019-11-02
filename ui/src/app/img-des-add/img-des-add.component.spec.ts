import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgDesAddComponent } from './img-des-add.component';

describe('ImgDesAddComponent', () => {
  let component: ImgDesAddComponent;
  let fixture: ComponentFixture<ImgDesAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgDesAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgDesAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
