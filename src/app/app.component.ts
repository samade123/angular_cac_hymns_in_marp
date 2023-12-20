import { Component, OnInit } from '@angular/core';
import { GrabNotiondbService } from './services/grab-notiondb.service';
import { NotionDBQuery, Result, SimpleHymn } from './test-interface';
import { StorageManagerService } from './services/storage-manager.service';
import { addHours, isPast, isFuture, addMinutes } from 'date-fns';
import { IndexDbManagerService } from './services/index-db-manager.service';
import { CommsService } from './services/comms.service';
import { Router } from '@angular/router';
import { RouterManagerService } from './services/router-manager.service';

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
    private routerManagerService: RouterManagerService
  ) {}

  notionPageTrackByFn = this.service.notionPageTrackByFn;
  isHymnPage = this.routerManagerService.isHymnPage;

  ngOnInit(): void {
    this.routerManagerService.setPageToMobileHome();
    this.initFullScreen();
    this.initHymnNumberComms();
    this.initHymnsDb();
  }

  initFullScreen(): void {
    this.commService.subscriber$.subscribe((data: any) => {
      if (data.type && data.type == 'fullscreen') {
        this.fullscreen = !this.fullscreen;
      }
    });
  }
  setFullScreen(): void {
    this.fullscreen = !this.fullscreen;

    this.commService.emitFullscreen({
      type: 'fullScreen',
      value: true,
    });
  }

  initHymnNumberComms(): void {
    this.commService.subscriber$.subscribe((data: any) => {
      if (data.type && data.type == 'hymnId') {
        // console.log(this.router.url, this.router.url.includes('?number'));

        if (this.router.url.includes('?number')) {
          this.selectHymnId(data.value);
        }
      }
    });

    // 'hymnIdFromMain'

    this.commService.mainAppSubscriber$.subscribe((data: any) => {
      if (data.type && data.type == 'hymnIdFromSidebar') {
        // console.log(data.value, 'worked');
        this.selectHymnId(data.value);
      } else if (data.type && data.type == 'reloadDb') {
        this.getNotionResponse();
      } else if (data.type && data.type == 'hymnIdFromMain') {
        if (this.selectedHymnId == '') { // only change if empty
          this.setCurrentHymn(data.value);
        }
      }
    });
  }

  pushToDb(): void {
    this.dbService.storeNewHymnsList(this.hymnsList);
  }

  setCurrentHymn(id: string): Promise<void> {
    this.selectedHymnId = id;

    return new Promise((resolve, reject) => {
      this.dbService
        .doesHymnbyIdExist(this.selectedHymnId, 'simpleHymns')
        .then(() => {
          this.dbService
            .getHymnItembyId(this.selectedHymnId, 'simpleHymns')
            .then((simpleHymn) => {
              this.selectedSimpleHymn = {
                id: '',
                name: '',
                last_edited_time: new Date(),
                hymnNumber: '',
                url: '',
              };
              this.selectedSimpleHymn = simpleHymn;
              setTimeout(() => {
                resolve();
              });
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  selectHymnId(id: string): void {
    // this.selectedHymnId = id;

    this.setCurrentHymn(id).then(() => {
      let currentExpiry = this.storageManagerService.getData(
        'last-request-date'
      ) as string;

      // console.log(isFuture(new Date(currentExpiry)), new Date(currentExpiry));

      this.dbService.doesHymnbyIdExist(this.selectedHymnId).then((exists) => {
        if (!exists) {
          console.log(isFuture(new Date(currentExpiry)));
          if (isFuture(new Date(currentExpiry))) {
            this.runThroughResults();
          } else this.getNotionResponse(true);
        } else {
          this.runThroughResults();
        }
      });
    });
  }

  async runThroughResults(): Promise<void> {
    if (
      await this.dbService.doesHymnbyIdExist(this.selectedHymnId, 'simpleHymns')
    ) {
      this.router.navigate(['/'], {
        queryParams: { number: this.selectedSimpleHymn.hymnNumber },
      });
    }
  }

  backToHymnsList(): void {
    this.router.navigate(['/hymns']);
  }

  getNotionResponse(runAndThenSelectHymn: Boolean = false): void {
    this.service.getFunctionData('api/getNotionQuery.js').subscribe(
      (response) => {
        const notionResponse = response as NotionDBQuery;
        this.data = notionResponse;
        this.results = [...notionResponse.results];
        this.storageManagerService.storeData('last-request', notionResponse);
        let newExpiry: Date = addHours(new Date(), 1);
        // let newExpiry: Date = addMinutes(new Date(), 1);

        this.storageManagerService.storeData('last-request-date', newExpiry);
        this.hymnsList = this.service.simplifyHymns(this.results);
        this.dbService.storeNewHymnsList(this.hymnsList);
        if (runAndThenSelectHymn) {
          this.runThroughResults();
        }
      },
      (error) => {
        console.error('Error fetching notion data:', error);
        // Handle the error here
      }
    );
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
    }

    if (this.storageManagerService.doesDataExist('last-request-date')) {
      let currentExpiry = this.storageManagerService.getData(
        'last-request-date'
      ) as string;
      console.log(
        isPast(addMinutes(new Date(currentExpiry), 1)),
        addMinutes(new Date(currentExpiry), 1)
      );

      if (isPast(addHours(new Date(currentExpiry), 1))) {
        // if (isPast(addMinutes(new Date(currentExpiry), 1))) {
        this.getNotionResponse();
        console.log('data expired, requesting new', currentExpiry);
      }
    }
  }
}
