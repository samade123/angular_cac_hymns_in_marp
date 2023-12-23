import { TestBed } from '@angular/core/testing';

import { LoadPolyFillService } from './load-poly-fill.service';

describe('LoadPolyFillService', () => {
  let service: LoadPolyFillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadPolyFillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
