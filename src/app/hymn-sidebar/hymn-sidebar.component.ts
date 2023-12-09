import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SimpleHymn, SimpleHymnItem } from './../test-interface';
import { GrabNotiondbService } from '../services/grab-notiondb.service';
import { IndexDbManagerService } from '../services/index-db-manager.service';
import { animate } from 'popmotion';
import { liveQuery } from 'dexie';
import { db } from './../db'; // You get a db with property table1 attached (because the schema is declared)
import { CommsService } from '../services/comms.service';

export interface ButtonFilters {
  name: string;
  selected: boolean;
}
@Component({
  selector: 'app-hymn-sidebar',
  templateUrl: './hymn-sidebar.component.html',
  styleUrls: ['./hymn-sidebar.component.scss'],
})
export class HymnSidebarComponent implements OnInit {
  constructor(
    private notionService: GrabNotiondbService,
    private dBstorageServie: IndexDbManagerService,
    private commService: CommsService,

  ) {}
  @Input() simpleHymns: SimpleHymn[];
  @Output() selectedHymnId = new EventEmitter<string>();
  @Output() reload = new EventEmitter<void>();

  hymnTrackbyFn = this.notionService.simpleHymnsTrackByFn;
  simpleHymnItemsTrackByFn = this.notionService.simpleHymnItemsTrackByFn;
  buttonFilters: ButtonFilters[] = [
    { name: 'Most recent', selected: true },
    { name: 'All Hymns', selected: false },
  ];
  inputFocusBgDeg = '180deg';
  searchQuery: string = '';
  friends$ = liveQuery(() =>
    this.dBstorageServie.listSimpleHymns(this.searchQuery)
  );
  allSimpleHymns$ = liveQuery(async () => {
    return await this.dBstorageServie.returnAll();
  });
  hymnItemsArr$ = liveQuery(async () => {
    return await this.dBstorageServie.getLastFiveHymns();
    // return await db.table('simpleHymnItems')
    //   .orderBy('last_used_time')
    //   .reverse()
    //   .limit(5)
    //   .toArray() as SimpleHymnItem[];
  });

  ngOnInit(): void {
    console.log('here');

    this.dBstorageServie.returnAll().then(async (arr) => {
      if (arr.length == 0) {
        await db.on('ready', () => {});
        setTimeout(() => {
          this.filterHymns(this.buttonFilters[1]);
        }, 1000);
      }
    });
  }
  filterHymns(buttonFilter: ButtonFilters): void {
    this.buttonFilters.forEach((btn) => (btn.selected = false));
    buttonFilter.selected = true;
  }

  pickHymn(hymnId: string): void {
    // this.selectedHymnId.emit(hymnId);
    this.searchQuery = '';
    this.commService.emitHymnIdFromSidebar({
      type: 'hymnIdFromSidebar',
      value: hymnId,
    });
  }

  focusInput(): void {
    animate({
      from: '21deg',
      to: '180deg',
      duration: 600,
      onUpdate: (latest) => (this.inputFocusBgDeg = latest),
    });
  }

  loseFocus(): void {
    animate({
      from: '180deg',
      to: '21deg',
      duration: 600,
      onUpdate: (latest) => (this.inputFocusBgDeg = latest),
    });
  }

  queryDb(): void {
    this.friends$ = liveQuery(() =>
      this.dBstorageServie.listSimpleHymns(this.searchQuery)
    );
  }
  reloadDb(): void {
    this.reload.emit();
  }
}
