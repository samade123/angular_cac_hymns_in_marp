import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RouterManagerService {
  constructor(private router: Router) {}

  trackNavigation(onNavigationCallback: () => void) {
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        console.log(event, 'sdasd');
        const currentUrl = event.url;
        await onNavigationCallback();
      }
    });
  }
}
