import { TestBed } from '@angular/core/testing';

import { PwaManagerService } from './pwa-manager.service';

describe('PwaManagerService', () => {
  let service: PwaManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PwaManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
