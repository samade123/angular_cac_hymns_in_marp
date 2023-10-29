import { Component, OnInit } from '@angular/core';
import { GrabNotiondbService } from './grab-notiondb.service';
import { NotionDBQuery, Result } from './test-interface';
import { StorageManagerService } from './storage-manager.service';
import { addHours, isPast } from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'marp-hymns';
  data: NotionDBQuery;
  results: Result[]; //define it here

  constructor(
    private service: GrabNotiondbService,
    private storageManagerService: StorageManagerService
  ) {}

  ngOnInit(): void {
    if (!this.storageManagerService.doesDataExist('last-request')) {
      this.getNotionResponse();
      console.log('data not exists, requesting new')
    } else if (this.storageManagerService.doesDataExist('last-request-date')) {
      let currentExpiry = this.storageManagerService.getData(
        'last-request-date'
      ) as Date;
      if (isPast(currentExpiry)) {
        this.getNotionResponse();
        console.log('data expired, requesting new')

      }
    } else {
      console.log('using stored data')

      const notionResponse = this.storageManagerService.getData(
        'last-request'
      ) as NotionDBQuery;
      this.data = notionResponse;
      this.results = [...notionResponse.results];
      if (!this.storageManagerService.doesDataExist('last-request-date')) {
        let newExpiry: Date = addHours(new Date(), 1);
        this.storageManagerService.storeData('last-request-date', newExpiry);

      }
    }
    this.service.getFunctionData('api/getNotionQuery.js').subscribe((response) => {
      const notionResponse = response as NotionDBQuery;
      this.data = notionResponse;
      this.results = [...notionResponse.results];
      this.storageManagerService.storeData('last-request', notionResponse);
      let newExpiry: Date = addHours(new Date(), 48);
      this.storageManagerService.storeData('last-request-date', newExpiry);

      // console.log(response);
    });
  }
}
