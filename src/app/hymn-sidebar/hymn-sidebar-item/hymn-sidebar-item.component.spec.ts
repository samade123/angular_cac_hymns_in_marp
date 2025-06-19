import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HymnSidebarItemComponent } from './hymn-sidebar-item.component';

describe('HymnSidebarItemComponent', () => {
  let component: HymnSidebarItemComponent;
  let fixture: ComponentFixture<HymnSidebarItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HymnSidebarItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HymnSidebarItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
