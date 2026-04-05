import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationLogs } from './application-logs';

describe('ApplicationLogs', () => {
  let component: ApplicationLogs;
  let fixture: ComponentFixture<ApplicationLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationLogs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationLogs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
