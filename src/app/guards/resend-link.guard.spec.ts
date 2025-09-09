import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { ResendLinkGuard } from './resend-link.guard';

describe('resendLinkGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => {
    const resendLinkGuard = new ResendLinkGuard();
    return TestBed.runInInjectionContext(() =>
      resendLinkGuard.canActivate(...guardParameters)
    );
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
