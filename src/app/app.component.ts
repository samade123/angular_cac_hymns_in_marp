import { Component, OnInit } from '@angular/core';
import { GrabNotiondbService } from './services/grab-notiondb.service';
import { NotionDBQuery, Result, SimpleHymn } from './test-interface';
import { StorageManagerService } from './services/storage-manager.service';
import { addHours, isPast } from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'marp-hymns';
  data: NotionDBQuery;
  hymnsList: SimpleHymn[];
  results: Result[]; //define it here
  selectedHymnId: string = '';
  selectedHymnObject: Result;

  constructor(
    private service: GrabNotiondbService,
    private storageManagerService: StorageManagerService
  ) {}

  notionPageTrackByFn = this.service.notionPageTrackByFn;

  ngOnInit(): void {
    if (!this.storageManagerService.doesDataExist('last-request')) {
      this.getNotionResponse();
      console.log('data not exists, requesting new');
    } else {
      console.log('using stored data');

      const notionResponse = this.storageManagerService.getData(
        'last-request'
      ) as NotionDBQuery;
      this.data = notionResponse;
      this.results = [...notionResponse.results];
      this.hymnsList = this.service.simplifyHymns(this.results);

      console.log(this.results);

      if (!this.storageManagerService.doesDataExist('last-request-date')) {
        let newExpiry: Date = addHours(new Date(), 1);
        this.storageManagerService.storeData('last-request-date', newExpiry);
      }
    }

    if (this.storageManagerService.doesDataExist('last-request-date')) {
      let currentExpiry = this.storageManagerService.getData(
        'last-request-date'
      ) as string;
      if (isPast(addHours(new Date(currentExpiry), 1))) {
        this.getNotionResponse();
        console.log('data expired, requesting new', currentExpiry);
      }
    }
  }

  selectHymnId(id: string): void {
    this.results.every((result) => {
      // console.log(result, id, result.id === id);

      if (result.id === id) {
        this.selectedHymnObject = result;
        return false;
      } else return true;
    });
  }

  getNotionResponse(): void {
    this.service.getFunctionData('api/getNotionQuery.js').subscribe((response) => {
      const notionResponse = response as NotionDBQuery;
      this.data = notionResponse;
      this.results = [...notionResponse.results];
      this.storageManagerService.storeData('last-request', notionResponse);
      let newExpiry: Date = addHours(new Date(), 1);
      this.storageManagerService.storeData('last-request-date', newExpiry);
      this.hymnsList = this.service.simplifyHymns(this.results);

      console.log(this.hymnsList);
    });
  }
}
