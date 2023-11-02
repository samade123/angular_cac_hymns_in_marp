import { TestBed } from '@angular/core/testing';

import { PresentationToolsService } from './presentation-tools.service';

describe('PresentationToolsService', () => {
  let service: PresentationToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresentationToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
