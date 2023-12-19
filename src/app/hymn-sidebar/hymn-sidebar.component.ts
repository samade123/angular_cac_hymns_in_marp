import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SimpleHymn, SimpleHymnItem } from './../test-interface';
import { GrabNotiondbService } from '../services/grab-notiondb.service';
import { IndexDbManagerService } from '../services/index-db-manager.service';
import { animate } from 'popmotion';
import { liveQuery } from 'dexie';
import { db } from './../db'; // You get a db with property table1 attached (because the schema is declared)
import { CommsService } from '../services/comms.service';
import { PaginatorState } from 'primeng/paginator';

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
    private commService: CommsService
  ) {}
  @Input() simpleHymns: SimpleHymn[];
  @Output() selectedHymnId = new EventEmitter<string>();
  @Output() reload = new EventEmitter<void>();

  hymnTrackbyFn = this.notionService.simpleHymnsTrackByFn;
  simpleHymnItemsTrackByFn = this.notionService.simpleHymnItemsTrackByFn;
  // hymnsLengthFromDb = this.dBstorageServie.getTableLength
  hymnsLength: number = 0;
  buttonFilters: ButtonFilters[] = [
    { name: 'Most recent', selected: true },
    { name: 'All Hymns', selected: false },
  ];
  inputFocusBgDeg = '180deg';
  searchQuery: string = '';
  zeroHymns: boolean = false;
  friends$ = liveQuery(() =>
    this.dBstorageServie.listSimpleHymns(this.searchQuery)
  );
  allSimpleHymns$ = liveQuery(async () => {
    return await this.dBstorageServie.returnAll(0);
  });
  hymnItemsArr$ = liveQuery(async () => {
    return await this.dBstorageServie.getLastFiveHymns();
  });
  offset: number = 0;

  ngOnInit(): void {
    this.dBstorageServie.checkForEmptyDb(
      () => {
        this.commService.mainAppSubscriber$.subscribe((data: any) => {
          if ((data.type = 'webworker')) {
            this.defineLivequeries();
            this.zeroHymns = false;
          }
        });
      },
      () => {
        this.defineLivequeries();
      }
    );

    this.dBstorageServie.returnAll().then(async (arr) => {
      if (arr.length == 0) {
        this.zeroHymns = true;
        await db.on('ready', () => {});
        setTimeout(() => {
          this.filterHymns(this.buttonFilters[1]);
        }, 1000);
      } else {
        this.zeroHymns = false;
      }
    });
  }

  defineLivequeries(): void {
    this.friends$ = liveQuery(() =>
      this.dBstorageServie.listSimpleHymns(this.searchQuery)
    );
    this.allSimpleHymns$ = liveQuery(async () => {
      return await this.dBstorageServie.returnAll(this.offset);
    });
    this.hymnItemsArr$ = liveQuery(async () => {
      return await this.dBstorageServie.getLastFiveHymns();
    });

    this.dBstorageServie
      .getTableLength()
      .then((number) => {
        this.hymnsLength = number;
      })
      .catch(() => (this.hymnsLength = 0));
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

  onPageChange(event: PaginatorState): void {
    // console.log(event);
    if (typeof event.page == 'number') {
      this.offset = event.page * 10;
      //  console.log(this.offset)
      this.defineLivequeries();
    }
  }
}
