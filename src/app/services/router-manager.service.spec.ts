import { TestBed } from '@angular/core/testing';

import { RouterManagerService } from '../services/router-manager.service';

describe('RouterManagerService', () => {
  let service: RouterManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouterManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
