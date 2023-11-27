import { Component, OnInit } from '@angular/core';
import { GrabNotiondbService } from './services/grab-notiondb.service';
import { NotionDBQuery, Result, SimpleHymn } from './test-interface';
import { StorageManagerService } from './services/storage-manager.service';
import { addHours, isPast, isFuture } from 'date-fns';
import { IndexDbManagerService } from './services/index-db-manager.service';
import { CommsService } from './services/comms.service';
import { Router } from '@angular/router';


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
  selectedSimpleHymn: SimpleHymn;
  fullscreen = false;

  constructor(
    private service: GrabNotiondbService,
    private storageManagerService: StorageManagerService,
    private dbService: IndexDbManagerService,
    private commService: CommsService,
    private router: Router,
  ) {}

  notionPageTrackByFn = this.service.notionPageTrackByFn;

  ngOnInit(): void {
    this.initFullScreen();
    this.initHymnNumberComms();
    this.initHymnsDb();
  }

  initFullScreen(): void {
    this.commService.subscriber$.subscribe((data: any) => {
      if (data.type && data.type == 'fullscreen') {
        this.fullscreen = !this.fullscreen
      }
    });
  }

  initHymnNumberComms(): void {
    this.commService.subscriber$.subscribe((data: any) => {
      if (data.type && data.type == 'hymnId') {
        this.selectHymnId(data.value)
      }
    });
  }

  pushToDb(): void {
    this.dbService.storeNewHymnsList(this.hymnsList);
  }

  selectHymnId(id: string): void {
    this.selectedHymnId = id;

    let currentExpiry = this.storageManagerService.getData(
      'last-request-date'
    ) as string;
    this.dbService.doesHymnbyIdExist(this.selectedHymnId).then((exists) => {
      if (!exists) {
        if (isFuture(new Date(currentExpiry))) {
         this.runThroughResults()
        }
      } else {
        this.runThroughResults()
      }
    });
  }

  async runThroughResults(): Promise<void> {
    // this.results.every((result) => {
    //   if (result.id === this.selectedHymnId) {
    //     this.selectedHymnObject = result;
    //     return false;
    //   } else return true;
    // });

    if (
      await this.dbService.doesHymnbyIdExist(this.selectedHymnId, 'simpleHymns')
    ) {
      this.selectedSimpleHymn = await this.dbService.getHymnItembyId(
        this.selectedHymnId,
        'simpleHymns'
      );
      this.router.navigate(['/'], { queryParams: { number: this.selectedSimpleHymn.hymnNumber } });
      this.commService.emitSimpleHymnData({
        type: 'simpleHymn',
        value: this.selectedSimpleHymn,
      });
    }

    // this.commService.emitHymnData(this.selectedHymnObject);
  }

  getNotionResponse(): void {
    this.service
      .getFunctionData('api/getNotionQuery.js')
      .subscribe((response) => {
        const notionResponse = response as NotionDBQuery;
        this.data = notionResponse;
        this.results = [...notionResponse.results];
        this.storageManagerService.storeData('last-request', notionResponse);
        let newExpiry: Date = addHours(new Date(), 1);
        this.storageManagerService.storeData('last-request-date', newExpiry);
        this.hymnsList = this.service.simplifyHymns(this.results);
        this.dbService.storeNewHymnsList(this.hymnsList);
      });
  }

  failedFetch(): void {
    this.getNotionResponse();
    this.selectHymnId(this.selectedHymnId);
  }

  private initHymnsDb(): void {
    if (!this.storageManagerService.doesDataExist('last-request-date')) {
      this.getNotionResponse();
      console.log('data not exists, requesting new');
    } else {
      console.log('using stored data');

      // const notionResponse = this.storageManagerService.getData(
      //   'last-request'
      // ) as NotionDBQuery;
      // this.data = notionResponse;
      // this.results = [...notionResponse.results];
      // this.hymnsList = this.service.simplifyHymns(this.results);
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
}
