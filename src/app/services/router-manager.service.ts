import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class RouterManagerService {
  constructor(private router: Router) {}

  trackNavigation(onNavigationCallback: () => void) {
    this.router.events.subscribe(async (event) => {
      // console.log(event, 'sdasd');

      if (event instanceof NavigationEnd) {
        // console.log(event, 'sdasd');
        const currentUrl = event.url;
        await onNavigationCallback();
      }
    });
  }

  isHymnPage(): Boolean {
    if (this.router.url.includes('number')) {
      return true;
    } else return false;
  }

  setPageToMobileHome(): void {
    if (!this.router.url.includes('number')) {
      if (window.innerWidth < 600) {
        this.router.navigate(['/hymns']);
      }
    }
  }
}
