import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { HymnSidebarItemComponent } from './hymn-sidebar-item.component';
import { DisplayHymn } from 'src/app/test-interface';

describe('HymnSidebarItemComponent', () => {
  let component: HymnSidebarItemComponent;
  let fixture: ComponentFixture<HymnSidebarItemComponent>;
  let compiled: HTMLElement;

  const mockHymn: DisplayHymn = {
    id: '1',
    hymnNumber: '123',
    name: 'Test Hymn',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HymnSidebarItemComponent],
      imports: [CommonModule], // For the 'date' pipe
    }).compileComponents();

    fixture = TestBed.createComponent(HymnSidebarItemComponent);
    component = fixture.componentInstance;
    // Provide a default hymnItem to prevent template errors
    component.hymnItem = mockHymn;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hymn number and title', () => {
    expect(
      compiled.querySelector('.hymn-select-item__number')?.textContent
    ).toContain('123');
    expect(
      compiled.querySelector('.hymn-select-item__title')?.textContent
    ).toContain('Test Hymn');
  });

  it('should have the correct data-number attribute and style', () => {
    const item = compiled.querySelector('.hymn-select-item');
    expect(item?.getAttribute('data-number')).toBe('123');
    expect((item as HTMLElement).style.getPropertyValue('--hymn-number')).toBe(
      ' 123'
    );
  });

  it('should not display subtitle when lastOpenedEnabled is false', () => {
    component.lastOpenedEnabled = false;
    component.hymnItem = {
      ...mockHymn,
      last_used_time: new Date(),
      last_edited_time: new Date(),
    };
    fixture.detectChanges();
    const subtitle = compiled.querySelector('.hymn-select-item__subtitle');
    expect(subtitle?.textContent?.trim()).toBe('');
  });

  it('should not display subtitle when lastOpenedEnabled is true but no dates are provided', () => {
    component.lastOpenedEnabled = true;
    component.hymnItem = mockHymn; // No dates
    fixture.detectChanges();
    const subtitle = compiled.querySelector('.hymn-select-item__subtitle');
    expect(subtitle?.textContent?.trim()).toBe('');
  });

  it('should display last_used_time when lastOpenedEnabled is true', () => {
    const testDate = new Date('2023-01-15T12:00:00Z');
    component.hymnItem = { ...mockHymn, last_used_time: testDate };
    component.lastOpenedEnabled = true;
    fixture.detectChanges();
    const subtitle = compiled.querySelector('.hymn-select-item__subtitle');
    // Default format for date pipe is 'MMM d, y'
    expect(subtitle?.textContent).toContain('Last opened: Jan 15, 2023');
  });

  it('should display last_edited_time when lastOpenedEnabled is true', () => {
    const testDate = new Date('2023-02-20T12:00:00Z');
    component.hymnItem = { ...mockHymn, last_edited_time: testDate };
    component.lastOpenedEnabled = true;
    fixture.detectChanges();
    const subtitle = compiled.querySelector('.hymn-select-item__subtitle');
    expect(subtitle?.textContent).toContain('Last opened: Feb 20, 2023');
  });

  it('should display both times when lastOpenedEnabled is true and both dates are provided', () => {
    const usedDate = new Date('2023-01-15T12:00:00Z');
    const editedDate = new Date('2023-02-20T12:00:00Z');
    component.hymnItem = { ...mockHymn, last_used_time: usedDate, last_edited_time: editedDate };
    component.lastOpenedEnabled = true;
    fixture.detectChanges();
    const subtitleSpans = compiled.querySelectorAll('.hymn-select-item__subtitle span');
    expect(subtitleSpans.length).toBe(2);
    expect(subtitleSpans[0].textContent).toContain('Last opened: Jan 15, 2023');
    expect(subtitleSpans[1].textContent).toContain('Last opened: Feb 20, 2023');
  });
});
