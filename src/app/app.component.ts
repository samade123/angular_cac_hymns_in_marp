import { Component, HostListener, OnInit } from '@angular/core';
import { GrabNotiondbService } from './services/grab-notiondb.service';
import { NotionDBQuery, Result, SimpleHymn } from './test-interface';
import { StorageManagerService } from './services/storage-manager.service';
import {
  addHours,
  isPast,
  isFuture,
  addMinutes,
  format,
} from 'date-fns';
import { IndexDbManagerService } from './services/index-db-manager.service';
import { CommsService } from './services/comms.service';
import { Router } from '@angular/router';
import { RouterManagerService } from './services/router-manager.service';
import { LoadPolyFillService } from './services/load-poly-fill.service';

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
  currentExpiry: String;
  darkMode: Boolean = false;

  constructor(
    private service: GrabNotiondbService,
    private storageManagerService: StorageManagerService,
    private dbService: IndexDbManagerService,
    private commService: CommsService,
    private router: Router,
    private routerManagerService: RouterManagerService,
    private loadPolyFillService: LoadPolyFillService
  ) {}

  notionPageTrackByFn = this.service.notionPageTrackByFn;
  isHymnPage = this.routerManagerService.isHymnPage;

  ngOnInit(): void {
    this._initColorTheme();
    this.routerManagerService.setPageToMobileHome();
    this._initFullScreen();
    this._initHymnNumberComms();
    this._loadScript();
    this._initHymnsDb();
    this._initObserveFailedFetches();
  }

  setColourTheme(): void {
    let colourThemesAttribute = this.darkMode ? 'dark' : 'light';
    document.body.setAttribute('data-color-theme', `${colourThemesAttribute}`);
    this.storageManagerService.storeData('dark-mode', this.darkMode);
  }

  private _initColorTheme(): void {
    if (this.storageManagerService.doesDataExist('dark-mode')) {
      this.darkMode = this.storageManagerService.getData(
        'dark-mode'
      ) as Boolean;
    }
    this.setColourTheme();
  }

  private _loadScript(): void {
    this.loadPolyFillService
      .loadScript(
        'https://cdn.jsdelivr.net/npm/@marp-team/marpit-svg-polyfill/lib/polyfill.browser.js'
      )
      .then(() => {
        // Script loaded successfully
        console.log('polyfill loaded');
      })
      .catch((error) => {
        // Handle loading error
        console.error(error, 'issue with loading polyfill');
      });
  }

  private _initFullScreen(): void {
    this.commService.subscriber$.subscribe((data: any) => {
      if (data.type && data.type == 'fullscreen') {
        this.fullscreen = !this.fullscreen;
      }
    });
  }

  _initObserveFailedFetches(): void {
    this.commService.subscriber$.subscribe((data: any) => {
      if (data.type && data.type === 'fetchStatus') {
        if (!data.value) this.failedFetch();
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

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        console.log('Escape key pressed.', this.fullscreen);
        if (this.fullscreen) {
          this.setFullScreen();
        }
        break;
      case 'ArrowLeft':
        // console.log('Left arrow key pressed.');
        if (this.fullscreen) {
          // this.index =
          //   this.index > 0 ? (this.index - 1) % this.data.length : this.index;
          console.log('backward');

          this.commService.emitChangePage({
            type: 'direction',
            forward: false,
          });
        }
        break;
      case 'ArrowRight':
        // console.log('Right arrow key pressed.');
        console.log('forward');

        if (this.fullscreen) {
          this.commService.emitChangePage({
            type: 'direction',
            forward: true,
          });

          // default:
        }
        break;
    }
  }

  @HostListener('window:keydown.control.enter', ['$event'])
  onShortcut(event: KeyboardEvent) {
    // Your action for this shortcut
    if (!this.fullscreen) {
      this.setFullScreen();
    }
    // console.log('Ctrl+Shift+S pressed!');
  }

  _initHymnNumberComms(): void {
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
        if (this.selectedHymnId == '') {
          // only change if empty
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
        this.currentExpiry = format(newExpiry, 'p').toString();
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

  private _initHymnsDb(): void {
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
      this.currentExpiry = format(currentExpiry, 'p').toString();

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
