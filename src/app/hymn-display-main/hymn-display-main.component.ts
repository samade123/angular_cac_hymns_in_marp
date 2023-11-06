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
import { Result } from './../test-interface';
import { GrabNotiondbService } from '../services/grab-notiondb.service';
import { Marpit } from '@marp-team/marpit';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StorageManagerService } from '../services/storage-manager.service';
import { PresentationToolsService } from '../services/presentation-tools.service';
import { IndexDbManagerService } from '../services/index-db-manager.service';

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
    private dbStorageService: IndexDbManagerService
  ) {}
  @Input() hymn: Result;
  @Input() fullscreenState: Boolean;

  @Output() fullscreenEmitter = new EventEmitter<boolean>();
  // fullscreenState = false;

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

  ngOnInit(): void {
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
  }
  async ngOnChanges(changes: SimpleChanges) {
    if (changes.hymn && !changes.hymn.firstChange) {
      this.url =
        changes.hymn.currentValue.properties['Files & media']['files'][0][
          'file'
        ]['url'];
      this.hymnNumber =
        changes.hymn.currentValue.properties['Number']['title'][0][
          'plain_text'
        ];
      if (this.url) {
        // if (this.hymnDict[this.hymnNumber]) {
        if (await this.dbStorageService.doesHymnExist(this.hymnNumber)) {
          // this.file = this.hymnDict[this.hymnNumber];
          this.dbStorageService.getHymnItem(this.hymnNumber).then((hymnItem)=> {
            this.file = hymnItem.marp
            hymnItem.last_used_time = new Date();
            this.dbStorageService.storeData('simpleHymnItems', hymnItem);
          this.renderMarp();
          })
        } else {
          this.service
            .getMarp(this.url)
            .then((file) => {
              this.file = file;
              this.hymnDict[this.hymnNumber] = this.file;
              this.renderMarp();
              // this.storageService.storeData('hymn-dict', this.hymnDict);
              let hymnItem = this.service.simplifyHymnItem(
                this.hymn,
                this.file
              );
              this.dbStorageService.storeData('simpleHymnItems', hymnItem);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
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

  fullscreen(): void {
    this.fullscreenEmitter.emit(!this.fullscreenState);
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

  windowChanged(): void {
    this.updateSize();
    this.renderMarp();
  }

  updateSize(): void {
    let main = document.getElementById('main');
    this.themeString = `
/* @theme my-second-theme */
section {
  width: ${main ? Math.floor((main.offsetWidth * 9) / 10) : '640'}px;
  height: ${main ? Math.floor((window.innerHeight * 7.6) / 10) : '640'}px;
}

section :is(h1) {
  font-size: 1.2em;
  margin: 0;
}

section :is(h2) {
  font-size: 1em;
  margin: 0;
}
section li, section p {
  font-size: 0.85em;
}
section footer {
  place-self: start end;
  font-size: 0.8em;
  color: #3333;
  grid-column: span 2;
}
section header {
  display: none;
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


    this.html.forEach((page,index)=>{

      let safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, html[index]);

      if (typeof safeHtml == 'string') {
        this.data.push(safeHtml);
      }
    })

    let tempDiv = document.getElementById('template-div');

    // if (tempDiv instanceof HTMLElement) {
    //   this.appendSvgToDivWithImportNode(this.html[0], tempDiv);
    // }

    this.sheet.innerHTML = css;
  }
}
