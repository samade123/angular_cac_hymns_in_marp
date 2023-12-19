import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SecurityContext,
  SimpleChanges,
} from '@angular/core';
import {
  Properties,
  Result,
  SimpleHymn,
  SimpleHymnItem,
} from './../test-interface';
import { GrabNotiondbService } from '../services/grab-notiondb.service';
import { Marpit } from '@marp-team/marpit';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StorageManagerService } from '../services/storage-manager.service';
import { PresentationToolsService } from '../services/presentation-tools.service';
import { IndexDbManagerService } from '../services/index-db-manager.service';
import { CommsService } from '../services/comms.service';
import { ActivatedRoute } from '@angular/router';
import { RouterManagerService } from '../services/router-manager.service';

// import Marp from '@marp-team/marp-core';

@Component({
  selector: 'app-hymn-display-main',
  templateUrl: './hymn-display-main.component.html',
  styleUrls: ['./hymn-display-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HymnDisplayMainComponent implements OnInit, AfterViewInit {
  constructor(
    private service: GrabNotiondbService,
    private sanitizer: DomSanitizer,
    private storageService: StorageManagerService,
    private presentationService: PresentationToolsService,
    private dbStorageService: IndexDbManagerService,
    private commService: CommsService,
    private activatedRoute: ActivatedRoute,
    private routerManagerService: RouterManagerService,
    private ref: ChangeDetectorRef
  ) {
    // trackNavigation = this.routerManagerService.trackNavigation;
  }
  @Input() hymn: SimpleHymn;
  @Input() fullscreenState: Boolean;

  @Output() fullscreenEmitter = new EventEmitter<boolean>();
  @Output() failedFetch = new EventEmitter<Boolean>();
  // fullscreenState = false;
  hymnItem: SimpleHymnItem;
  url = '';
  hymnNumber = '';
  file = '';
  marpit = new Marpit({
    inlineSVG: true,
    markdown: { breaks: true },
  });
  html: string | Array<any> | string[] = '';
  data: SafeHtml[] = [];
  page: SafeHtml;
  css: string;
  sheet = document.createElement('style');
  theme: Marpit.Theme;
  themeString: string;
  hymnDict: { [hymnNumber: string]: string } = {};
  index = 0;
  routerMode: Boolean = true;
  trackNavigation = this.routerManagerService.trackNavigation;
  subscribeOnceFlag: Boolean = false;
  showHymns: Boolean = false;

  ngOnInit(): void {
    this.initSimpleHymn();
    // this.renderMarp();
    // this.initFullScreen();
    document.body.appendChild(this.sheet);
    if (this.storageService.doesDataExist('hymn-dict')) {
      let hymnDict = this.storageService.getData('hymn-dict');
      if (
        typeof hymnDict === 'object' &&
        hymnDict !== null &&
        Object.keys(hymnDict).every((key) => typeof key === 'string')
      ) {
        this.hymnDict = Object.assign(hymnDict);
      }
    }
    this.themeString = this.presentationService.themeValueOne;
    this.theme = this.marpit.themeSet.add(this.themeString);
    this.marpit.themeSet.default = this.theme;
    // if(this.)
    this.initCheckRouter();

    this.routerManagerService.trackNavigation(() => {
      // if (!this.subscribeOnceFlag) {
        this.subscribeOnceFlag = true;
        setTimeout(() => {
          this.initCheckRouter();
        }, 0);
      // }
    });
    // this.trackNavigation(()=>this.initCheckRouter);
  }
  // async ngOnChanges(changes: SimpleChanges) {
  //   if (changes.hymn && !changes.hymn.firstChange) {
  //     this.getHymn(changes.hymn.currentValue.properties);
  //   }

  //   if (changes.fullscreenState && !changes.fullscreenState.firstChange) {
  //     if (this.fullscreenState) {
  //       this.presentationService.openFullscreen();
  //     } else {
  //       this.presentationService.closeFullscreen();
  //     }
  //     // this.updateSize();
  //     // this.renderMarp();
  //   }
  // }

  initFullScreen(): void {
    this.commService.subscriber$.subscribe((data: any) => {
      if ('type' in data && data.type == 'fullScreen') {
        alert('fullscreen')
        this.fullscreen()
      }
    });
  }

  initSimpleHymn() {
    this.commService.subscriber$.subscribe((data: any) => {
      if (
        !('type' in data) &&
        typeof data === 'object' &&
        'properties' in data &&
        'id' in data
      ) {
        // Since 'properties' exists, we know 'data' is of type 'Result'
        const resultData: Result = data;
        let simpleHymn = this.service.simplifyHymns([resultData])[0];
        this.getHymn(simpleHymn);
      } else if ('type' in data && data.type == 'simpleHymn') {
        // console.log('testing can we receieve this', data.value)
        let simpleHymn = data.value as SimpleHymn;
        // if (simpleHymn.hymnNumber != this.hymnNumber) {
          this.getHymn(simpleHymn);
        // }
      }
    });
    // this.routerManagerService.trackNavigation(this.initCheckRouter);
  }

  async getHymn(simpleHymn: SimpleHymn) {
    this.url = simpleHymn.url;
    if (simpleHymn.hymnNumber === this.hymnNumber) {
      return;
    }
    console.log('checking');
    this.hymnNumber = simpleHymn.hymnNumber;
    if (this.url) {
      // if (this.hymnDict[this.hymnNumber]) {
      if (await this.dbStorageService.doesHymnExist(this.hymnNumber)) {
        // this.file = this.hymnDict[this.hymnNumber];
        this.dbStorageService.getHymnItem(this.hymnNumber).then((hymnItem) => {
          this.file = hymnItem.marp;
          hymnItem.last_used_time = new Date();
          this.dbStorageService.storeData('simpleHymnItems', hymnItem);
          this.showHymns = true;
          this.hymnItem = hymnItem;
          this.renderMarp();
        });
      } else {
        this.service
          .getMarp(this.url)
          .then((file) => {
            // console.log(file, 'file for this hymn')
            this.file = file;
            this.hymnDict[this.hymnNumber] = this.file;
            this.showHymns = true;
            this.renderMarp();
            // this.storageService.storeData('hymn-dict', this.hymnDict);
            let hymnItem = this.service.simplifyHymnItem(simpleHymn, this.file);
            this.hymnItem = hymnItem;

            this.dbStorageService.storeData('simpleHymnItems', hymnItem);
          })
          .catch((err) => {
            console.error(err);
            this.failedFetch.emit();
          });
      }
    }
  }

  fullscreen(): void {
    // this.fullscreenEmitter.emit(!this.fullscreenState);
    this.commService.emitFullscreen({
      type: 'fullscreen',
      value: !this.fullscreenState,
    });
    // if (this.routerMode) {
    //   this.fullscreenState = !this.fullscreenState;
    //   // this.updateSize();
    //   // this.renderMarp();
    // }
  }

  appendSvgToDivWithImportNode = (
    svgString: string,
    div: HTMLElement
  ): void => {
    const parser = new DOMParser();
    const svgDocument = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = svgDocument.documentElement;

    // Import the SVG element into the current document.
    const importedSvgElement = document.importNode(svgElement, true);
    // console.log(importedSvgElement)
    while (div.firstChild && div.lastChild) {
      div.removeChild(div.lastChild);
    }

    // Append the imported SVG element to the div.
    div.appendChild(importedSvgElement);
  };

  ngAfterViewInit(): void {
    this.updateSize();
  }

  async initCheckRouter(): Promise<void> {
    // console.log('running');
    let routeHymnNumber: string | null =
      this.activatedRoute.snapshot.queryParams.number;
    if (typeof routeHymnNumber === 'string' && routeHymnNumber !== null) {
      // if (await this.dbStorageService.doesHymnExist(routeHymnNumber)) {
      //   let hymn = await this.dbStorageService.getHymnItem(routeHymnNumber);
      //   this.commService.emitHymnId({
      //     type: 'hymnId',
      //     value: hymn.id,
      //   });
      // }
      // else
      if (await this.dbStorageService.doesHymnExist(routeHymnNumber, 'simpleHymns')){
        let simpleHymn = await this.dbStorageService.getSimpleHymnByNumber(routeHymnNumber) as SimpleHymn;
        if (simpleHymn) {
          this.getHymn(simpleHymn)
          this.commService.emitIdFromMainChild({type: 'hymnIdFromMain', value: simpleHymn.id})
        }
      }
    }
  }

  updateSize(): void {
    this.themeString = `
/* @theme my-second-theme */
section {
  display: grid;
  gap: 0.5rem 1.5em;
  grid-template-columns: 1fr 1fr;
}

section:has(ol) {
  grid-template-columns: 1fr 1fr;
}

section :is(h1) {
  margin: 0;
}

section :is(h2) {
  margin: 0;
}

section :is(h3) {
  margin: 0;
}

section footer {
  place-self: self-end;
  color: #3333;
  grid-column: span 2;
  width: 100%;
}
section header {
  display: none;
}
section:has(ol li:only-of-type) ol {
  grid-column: span 1;
}
section p:only-of-type {
  grid-column: span 2;
}
section ol:has(li:only-of-type) + p{
  grid-column: span 1;
}
section ol:has(li:nth-of-type(2)) + p, section ol:has(li:nth-of-type(2)){
  grid-column: span 2;
}
`;
    if (this.marpit.themeSet) {
      this.marpit.themeSet.clear();
    }
    this.theme = this.marpit.themeSet.add(this.themeString);
    this.marpit.themeSet.default = this.theme;
  }

  checkHtml(): Boolean {
    return this.file.length > 0 || this.html[0] || this.url.length > 0;
  }

  renderMarp(): void {
    this.updateSize();
    this.html = [];
    this.data = [];
    this.index = 0;
    const { html, css } = this.marpit.render(this.file, {
      htmlAsArray: true,
    });
    this.css = css;
    this.html = html;

    // console.log(this.html, this.css, 'are the css and html files working')

    this.html.forEach((page, index) => {
      // let safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, html[index]);
      let safeHtml = this.sanitizer.bypassSecurityTrustHtml(html[index]) as {
        changingThisBreaksApplicationSecurity: String;
      };

      // console.log(typeof safeHtml['changingThisBreaksApplicationSecurity'] )
      if (
        typeof safeHtml['changingThisBreaksApplicationSecurity'] == 'string'
      ) {
        this.data.push(safeHtml);
        // console.log(this.data)
      }
    });
    this.sheet.innerHTML = css;
    console.log(this.data);
    this.ref.markForCheck();
    console.log('finished render');
  }
}
