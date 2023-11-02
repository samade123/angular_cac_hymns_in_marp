import { TestBed } from '@angular/core/testing';

import { GrabNotiondbService } from './grab-notiondb.service';

describe('GrabNotiondbService', () => {
  let service: GrabNotiondbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrabNotiondbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
