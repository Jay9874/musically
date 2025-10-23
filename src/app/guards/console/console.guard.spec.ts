import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { consoleGuard } from './console.guard';

describe('consoleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => consoleGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
