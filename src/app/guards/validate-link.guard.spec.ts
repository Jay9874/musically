import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { validateLinkGuard } from './validate-link.guard';

describe('validateLinkGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => validateLinkGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
