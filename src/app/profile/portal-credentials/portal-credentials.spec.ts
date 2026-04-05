import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalCredentials } from './portal-credentials';

describe('PortalCredentials', () => {
  let component: PortalCredentials;
  let fixture: ComponentFixture<PortalCredentials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortalCredentials]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortalCredentials);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
