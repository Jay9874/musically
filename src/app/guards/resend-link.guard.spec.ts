import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { resendLinkGuard } from './resend-link.guard';

describe('resendLinkGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => resendLinkGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
