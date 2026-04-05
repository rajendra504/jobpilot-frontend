import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesForm } from './preferences-form';

describe('PreferencesForm', () => {
  let component: PreferencesForm;
  let fixture: ComponentFixture<PreferencesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferencesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferencesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
