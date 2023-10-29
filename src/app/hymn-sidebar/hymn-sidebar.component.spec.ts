import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HymnSidebarComponent } from './hymn-sidebar.component';

describe('HymnSidebarComponent', () => {
  let component: HymnSidebarComponent;
  let fixture: ComponentFixture<HymnSidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HymnSidebarComponent]
    });
    fixture = TestBed.createComponent(HymnSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
