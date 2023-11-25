import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SecurityContext,
  SimpleChanges,
} from '@angular/core';
import { Properties, Result, SimpleHymnItem } from './../test-interface';
import { GrabNotiondbService } from '../services/grab-notiondb.service';
import { Marpit } from '@marp-team/marpit';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StorageManagerService } from '../services/storage-manager.service';
import { PresentationToolsService } from '../services/presentation-tools.service';
import { IndexDbManagerService } from '../services/index-db-manager.service';
import { CommsService } from '../services/comms.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-hymn-display-main',
  templateUrl: './hymn-display-main.component.html',
  styleUrls: ['./hymn-display-main.component.scss'],
})
export class HymnDisplayMainComponent implements OnInit, AfterViewInit {
  constructor(
    private service: GrabNotiondbService,
    private sanitizer: DomSanitizer,
    private storageService: StorageManagerService,
    private presentationService: PresentationToolsService,
    private dbStorageService: IndexDbManagerService,
    private commService: CommsService,
    private activatedRoute: ActivatedRoute
  ) {}
  @Input() hymn: Result;
  @Input() fullscreenState: Boolean;

  @Output() fullscreenEmitter = new EventEmitter<boolean>();
  @Output() failedFetch = new EventEmitter<Boolean>();
  // fullscreenState = false;
  hymnItem: SimpleHymnItem;
  url = '';
  hymnNumber = '';
  file = '';
  marpit = new Marpit({
    inlineSVG: false,
  });
  html: string | Array<any> | string[] = '';
  data: SafeHtml[] = [];
  css: string;
  sheet = document.createElement('style');
  theme: Marpit.Theme;
  themeString: string;
  hymnDict: { [hymnNumber: string]: string } = {};
  index = 0;
  routerMode: Boolean = true;

  ngOnInit(): void {
    this.commService.subscriber$.subscribe((data: any) => {
      if (
        !('type' in data) &&
        typeof data === 'object' &&
        'properties' in data && 'id' in data
      ) {
        // Since 'properties' exists, we know 'data' is of type 'Result'
        const resultData: Result = data;
        this.getHymn(resultData.properties, resultData.id);
      } else {
        // If 'properties' isn't there, 'data' isn't of type 'Result'
        console.error('Invalid data received');
      }
    });
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
    this.initCheckRouter();
  }
  async ngOnChanges(changes: SimpleChanges) {
    if (changes.hymn && !changes.hymn.firstChange) {
      this.getHymn(changes.hymn.currentValue.properties);
    }

    if (changes.fullscreenState && !changes.fullscreenState.firstChange) {
      if (this.fullscreenState) {
        this.presentationService.openFullscreen();
      } else {
        this.presentationService.closeFullscreen();
      }
      this.updateSize();
      this.renderMarp();
    }
  }

  async getHymn(hymnProperty: Properties, id: string = '') {
    this.url = hymnProperty['Files & media']['files'][0]['file']['url'];
    this.hymnNumber = hymnProperty['Number']['title'][0]['plain_text'];
    if (this.url) {
      // if (this.hymnDict[this.hymnNumber]) {
      if (await this.dbStorageService.doesHymnExist(this.hymnNumber)) {
        // this.file = this.hymnDict[this.hymnNumber];
        this.dbStorageService.getHymnItem(this.hymnNumber).then((hymnItem) => {
          this.file = hymnItem.marp;
          hymnItem.last_used_time = new Date();
          this.dbStorageService.storeData('simpleHymnItems', hymnItem);
          this.hymnItem = hymnItem;
          this.renderMarp();
        });
      } else {
        this.service
          .getMarp(this.url)
          .then((file) => {
            this.file = file;
            this.hymnDict[this.hymnNumber] = this.file;
            this.renderMarp();
            // this.storageService.storeData('hymn-dict', this.hymnDict);
            let hymnItem = this.service.simplifyHymnItem(hymnProperty, this.file, id);
            this.hymnItem = hymnItem;

            this.dbStorageService.storeData('simpleHymnItems', hymnItem);
          })
          .catch((err) => {
            console.log(err);
            this.failedFetch.emit();
          });
      }
    }
  }

  fullscreen(): void {
    this.fullscreenEmitter.emit(!this.fullscreenState);
    this.commService.emitFullscreen({
      type: 'fullscreen',
      value: !this.fullscreenState,
    });

    if (this.routerMode) {
      this.fullscreenState = !this.fullscreenState;
    }
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

  private async initCheckRouter(): Promise<void> {
    let routeHymnNumber: string | null =
      this.activatedRoute.snapshot.queryParams.number;
    if (typeof routeHymnNumber === 'string' && routeHymnNumber !== null) {
      if (await this.dbStorageService.doesHymnExist(routeHymnNumber)) {
        let hymn = await this.dbStorageService.getHymnItem(routeHymnNumber);
        this.commService.emitHymnId({
          type: 'hymnId',
          value: hymn.id,
        });
      }
    }
  }

  windowChanged(): void {
    this.updateSize();
    this.renderMarp();
  }

  updateSize(): void {
    let main = document.getElementById('template-div');
    let scale = 0.7;

    this.themeString = `
/* @theme my-second-theme */
section {
  width: ${
    !this.fullscreenState
      ? Math.floor(((scale + 0.3) * (window.innerHeight * 0.5 * 4)) / 3)
      : Math.floor((scale + 0.1) * (window.innerWidth * 0.85))
    // : Math.floor(((scale + 0.3) * (window.innerHeight * 0.8 * 4)) / 3)
  }px;
  height: ${
    !this.fullscreenState
      ? Math.floor((scale + 0.3) * (window.innerHeight * 0.5))
      : Math.floor((scale + 0.3) * (window.innerHeight * 0.85))
  }px;
  display: grid;
  gap: 0.5rem 1.5em;
  grid-template-columns: 1fr 1fr;
}

section:has(ol) {
  grid-template-columns: 1fr 1fr;
}

section:has(ol) ol+p{
  max-width: 45vw;
}

section :is(h1) {
  font-size: ${!this.fullscreenState ? 1.2 * scale : '1.25'}em;
  margin: 0;
}

section :is(h2) {
  font-size: ${!this.fullscreenState ? 1 * scale : '1.05'}em;
  margin: 0;
}

section :is(h3) {
  font-size: ${!this.fullscreenState ? 0.9 * scale : '0.95'}em;
  margin: 0;
}
section li, section p {
  font-size: ${!this.fullscreenState ? 0.85 * scale : '0.93'}em;
}
section footer {
  place-self: self-end;
  font-size: ${!this.fullscreenState ? 0.55 * scale : '0.55'}em;
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
    window.addEventListener(
      'resize',
      () => {
        this.windowChanged();
      },
      { once: true }
    );
  }

  renderMarp(): void {
    this.html = [];
    this.data = [];
    this.index = 0;
    const { html, css } = this.marpit.render(this.file, {
      htmlAsArray: true,
    });
    this.css = css;
    this.html = html;

    this.html.forEach((page, index) => {
      let safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, html[index]);

      if (typeof safeHtml == 'string') {
        this.data.push(safeHtml);
      }
    });

    let tempDiv = document.getElementById('template-div');

    // if (tempDiv instanceof HTMLElement) {
    //   this.appendSvgToDivWithImportNode(this.html[0], tempDiv);
    // }

    this.sheet.innerHTML = css;
  }
}
