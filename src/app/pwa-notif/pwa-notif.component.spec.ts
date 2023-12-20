import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwaNotifComponent } from './pwa-notif.component';

describe('PwaNotifComponent', () => {
  let component: PwaNotifComponent;
  let fixture: ComponentFixture<PwaNotifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PwaNotifComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PwaNotifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
