import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  SecurityContext,
  SimpleChanges,
} from '@angular/core';
import { Result } from './../test-interface';
import { GrabNotiondbService } from '../grab-notiondb.service';
import { Marpit } from '@marp-team/marpit';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StorageManagerService } from '../storage-manager.service';

@Component({
  selector: 'app-hymn-display-main',
  templateUrl: './hymn-display-main.component.html',
  styleUrls: ['./hymn-display-main.component.scss'],
})
export class HymnDisplayMainComponent implements OnInit, AfterViewInit {
  constructor(
    private service: GrabNotiondbService,
    private sanitizer: DomSanitizer,
    private storageService: StorageManagerService
  ) {}
  @Input() hymn: Result;
  url = '';
  hymnNumber = '';
  file = '';
  marpit = new Marpit({
    inlineSVG: false,
  });
  html: string | Array<any> | string[] = '';
  data: SafeHtml;
  css: string;
  sheet = document.createElement('style');
  theme: Marpit.Theme;
  themeString: string;
  hymnDict: { [hymnNumber: string]: string } = {};

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
    this.themeString = `
  /* @theme my-first-theme */
  section {
    width: 640px;
    height: 360px;
  }
   section {
    width: 640px;
    height: 360px;
  }
  section :is(h1, h2) {
    font-size: 1.4rem;
  }
  `;
    this.theme = this.marpit.themeSet.add(this.themeString);
    this.marpit.themeSet.default = this.theme;
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes)
    if (!changes.hymn.firstChange) {
      this.url =
        changes.hymn.currentValue.properties['Files & media']['files'][0][
          'file'
        ]['url'];
      this.hymnNumber =
        changes.hymn.currentValue.properties['Number']['title'][0][
          'plain_text'
        ];
      if (this.url) {
        if (this.hymnDict[this.hymnNumber]) {
          this.file = this.hymnDict[this.hymnNumber];
          this.renderMarp();
        } else {
          this.service
            .getMarp(this.url)
            .then((file) => {
              this.file = file;
              this.hymnDict[this.hymnNumber] = this.file;
              this.renderMarp();
              this.storageService.storeData('hymn-dict', this.hymnDict);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
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
  height: ${main ? Math.floor((window.innerHeight * 7) / 10) : '640'}px;
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
    const { html, css } = this.marpit.render(this.file, {
      htmlAsArray: true,
    });
    this.css = css;
    this.html = html;
    let safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, html[0]);

    if (typeof safeHtml == 'string') {
      this.data = safeHtml;
    }
    let tempDiv = document.getElementById('template-div');

    // if (tempDiv instanceof HTMLElement) {
    //   this.appendSvgToDivWithImportNode(this.html[0], tempDiv);
    // }

    this.sheet.innerHTML = css;
  }
}
