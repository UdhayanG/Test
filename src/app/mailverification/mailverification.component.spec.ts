import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailverificationComponent } from './mailverification.component';

describe('MailverificationComponent', () => {
  let component: MailverificationComponent;
  let fixture: ComponentFixture<MailverificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MailverificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MailverificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
