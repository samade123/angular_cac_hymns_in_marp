import { Component, OnInit } from '@angular/core';
import { PwaManagerService } from '../services/pwa-manager.service';
import { CommsService } from '../services/comms.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-pwa-notif',
  standalone: false,
  // imports: [],
  templateUrl: './pwa-notif.component.html',
  styleUrl: './pwa-notif.component.scss',
})
export class PwaNotifComponent  implements OnInit{

  constructor(
    private commService: CommsService,
    private updates: SwUpdate
  ) {
  }

  showNewVersionPrompt: boolean = false;
  NewVersionReady: boolean = false;
  showUserPrompt: boolean = false;

  ngOnInit(): void {
    this.updates.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(
            `New app version ready for use: ${evt.latestVersion.hash}`
          );
          this.showNewVersionPrompt = true;
          this.NewVersionReady = this.showNewVersionPrompt;
          this.showUserPrompt = this.showNewVersionPrompt;
          console.log(this.showNewVersionPrompt)

          // commsService.emitPWAStatus({type: evt.type, value:  true})
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(
            `Failed to install app version '${evt.version.hash}': ${evt.error}`
          );
          break;
      }
    });
  }

  refresh() {
    console.debug('refresh!!');
    document.location.reload();
  }

  hideModal() {
    this.showUserPrompt = false;
  }
}
