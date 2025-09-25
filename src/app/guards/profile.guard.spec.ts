import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { profileGuard } from './profile.guard';

describe('profileGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => profileGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
