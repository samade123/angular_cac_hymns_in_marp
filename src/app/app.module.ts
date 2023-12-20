import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GrabNotiondbService } from './services/grab-notiondb.service';
import { HttpClientModule } from '@angular/common/http';
import { StorageManagerService } from './services/storage-manager.service';
import { HymnSidebarComponent } from './hymn-sidebar/hymn-sidebar.component';
import { HymnDisplayMainComponent } from './hymn-display-main/hymn-display-main.component';
import { IndexDbManagerService } from './services/index-db-manager.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ServiceWorkerModule } from '@angular/service-worker';
import { PwaNotifComponent } from './pwa-notif/pwa-notif.component';

@NgModule({
  declarations: [
    AppComponent,
    HymnSidebarComponent,
    HymnDisplayMainComponent,
    PwaNotifComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ButtonModule,
    PaginatorModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    GrabNotiondbService,
    StorageManagerService,
    IndexDbManagerService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
