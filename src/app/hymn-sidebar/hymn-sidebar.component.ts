import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SimpleHymn } from './../test-interface';
import { GrabNotiondbService } from '../services/grab-notiondb.service';
import { animate } from "popmotion"

@Component({
  selector: 'app-hymn-sidebar',
  templateUrl: './hymn-sidebar.component.html',
  styleUrls: ['./hymn-sidebar.component.scss'],
})
export class HymnSidebarComponent implements OnInit {
  constructor(private notionService: GrabNotiondbService) {}
  @Input() simpleHymns: SimpleHymn[];
  @Output() selectedHymnId = new EventEmitter<string>();
  hymnTrackbyFn = this.notionService.simpleHymnsTrackByFn;

  ngOnInit(): void {
    console.log('here');
  }

  pickHymn(hymnId: string): void {
    this.selectedHymnId.emit(hymnId);
  }
}
