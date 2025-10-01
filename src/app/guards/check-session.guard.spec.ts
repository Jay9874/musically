import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { checkSessionGuard } from './check-session.guard';

describe('checkSessionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => checkSessionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
