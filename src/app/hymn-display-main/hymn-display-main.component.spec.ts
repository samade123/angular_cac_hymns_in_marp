import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HymnDisplayMainComponent } from './hymn-display-main.component';

describe('HymnDisplayMainComponent', () => {
  let component: HymnDisplayMainComponent;
  let fixture: ComponentFixture<HymnDisplayMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HymnDisplayMainComponent]
    });
    fixture = TestBed.createComponent(HymnDisplayMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
