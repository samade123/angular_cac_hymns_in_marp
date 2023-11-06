import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SimpleHymn, SimpleHymnItem } from './../test-interface';
import { GrabNotiondbService } from '../services/grab-notiondb.service';
import { IndexDbManagerService } from '../services/index-db-manager.service';
import { animate } from "popmotion"

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
    private dBstorageServie: IndexDbManagerService
  ) {}
  @Input() simpleHymns: SimpleHymn[];
  @Output() selectedHymnId = new EventEmitter<string>();
  hymnItemsArr: SimpleHymnItem[];
  allSimpleHymns: SimpleHymn[];
  hymnTrackbyFn = this.notionService.simpleHymnsTrackByFn;
  simpleHymnItemsTrackByFn = this.notionService.simpleHymnItemsTrackByFn;
  buttonFilters: ButtonFilters[] = [
    { name: 'Most recent', selected: true },
    { name: 'All Hymns', selected: false },
  ];
  inputFocusBgDeg = '180deg'

  ngOnInit(): void {
    console.log('here');
    this.dBstorageServie.getLastFiveHymns().then((arr) => {
      this.hymnItemsArr = [...arr];
    });
    this.dBstorageServie.returnAll().then((arr) => {
      this.allSimpleHymns = [...arr];
    });
  }
  filterHymns(buttonFilter: ButtonFilters): void {
    this.buttonFilters.forEach((btn) => (btn.selected = false));
    buttonFilter.selected = true;
  }

  pickHymn(hymnId: string): void {
    this.selectedHymnId.emit(hymnId);
  }
}
