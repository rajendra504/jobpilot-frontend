import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionManager } from './session-manager';

describe('SessionManager', () => {
  let component: SessionManager;
  let fixture: ComponentFixture<SessionManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
