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
          <span *ngIf="hymnItem.hasLocal" class="hymn-item__local-badge" title="Local custom version available">
            <i class="pi pi-file-edit"></i>
          </span>
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
          text-transform: uppercase;
        }

        &__title {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        &__local-badge {
          font-size: 0.7rem;
          color: #38bdf8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(56, 189, 248, 0.15);
          border-radius: 3px;
          padding: 1px 3px;
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
