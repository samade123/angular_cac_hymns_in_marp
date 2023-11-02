import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PresentationToolsService {
  elem: HTMLElement;
  themeValueOne: string
  constructor() {
    this.elem = document.documentElement;
    this.themeValueOne = `
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
  }

  // elem = document.documentElement;

  /* View in fullscreen */
  openFullscreen(): void {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    }
  }

  /* Close fullscreen */
  closeFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
