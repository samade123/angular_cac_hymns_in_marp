import { TestBed } from '@angular/core/testing';

import { IndexDbManagerService } from './index-db-manager.service';

describe('IndexDbManagerService', () => {
  let service: IndexDbManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexDbManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
