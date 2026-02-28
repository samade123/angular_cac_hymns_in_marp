import { Component, Input } from '@angular/core';
import { PreFetchHymn, FetchedHymn, DisplayHymn } from 'src/app/test-interface';

@Component({
  selector: 'app-hymn-sidebar-item',
  template: `
    <div class="hymn-item">
      <div class="hymn-item__number">
        {{ hymnItem.hymnNumber }}
      </div>
      <div>
        <div class="hymn-item__title">
          {{ hymnItem.name }}
        </div>
        <div
          class="hymn-item__meta"
          *ngIf="
            lastOpenedEnabled &&
            (hymnItem.last_used_time || hymnItem.last_edited_time)
          "
        >
          Last opened:
          {{ hymnItem.last_used_time || hymnItem.last_edited_time | date }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .hymn-item {
        display: grid;
        grid-template-columns: 60px 1fr;
        padding: 12px 1.25rem;
        border-bottom: 1px solid var(--border-ui);
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        &__number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--accent-primary);
        }

        &__title {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-main);
        }

        &__meta {
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
      }
    `,
  ],
})
export class HymnSidebarItemComponent {
  @Input() hymnItem: DisplayHymn;
  @Input() lastOpenedEnabled: Boolean = false;
}
