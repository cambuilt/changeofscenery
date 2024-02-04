import { TestBed } from '@angular/core/testing';

import { PlaceDetailGuard } from './place-detail.guard';

describe('PlaceDetailGuard', () => {
  let guard: PlaceDetailGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PlaceDetailGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
