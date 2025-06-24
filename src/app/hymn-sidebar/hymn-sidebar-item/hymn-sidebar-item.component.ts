import { Component, Input } from '@angular/core';
import { PreFetchHymn, FetchedHymn, DisplayHymn } from 'src/app/test-interface';

@Component({
  selector: 'app-hymn-sidebar-item',
  template: `
    <div
      class="hymn-select-item"
      [style]="'--hymn-number: ' + hymnItem.hymnNumber"
      [attr.data-number]="hymnItem.hymnNumber"
    >
      <div class="hymn-select-item__number">
        {{ hymnItem.hymnNumber }}
      </div>
      <h3 class="hymn-select-item__title">
        {{ hymnItem.name }}
      </h3>
      <h4 class="hymn-select-item__subtitle">
        <span *ngIf="lastOpenedEnabled && hymnItem.last_used_time"
          >Last opened: {{ hymnItem.last_used_time | date }}</span
        >
        <span *ngIf="lastOpenedEnabled && hymnItem.last_edited_time"
          >Last opened: {{ hymnItem.last_edited_time | date }}</span
        >
      </h4>
    </div>
  `,
  styleUrls: ['./hymn-sidebar-item.component.scss'],
})
export class HymnSidebarItemComponent {
  @Input() hymnItem: DisplayHymn;
  @Input() lastOpenedEnabled: Boolean = false;
}
