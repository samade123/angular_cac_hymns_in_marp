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
import { ChipModule } from 'primeng/chip';
import { PaginatorModule } from 'primeng/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Import
import { ServiceWorkerModule } from '@angular/service-worker';
import { PwaNotifComponent } from './pwa-notif/pwa-notif.component';
import { HymnSidebarItemComponent } from './hymn-sidebar/hymn-sidebar-item/hymn-sidebar-item.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputNumberModule } from 'primeng/inputnumber';

@NgModule({
  declarations: [
    AppComponent,
    HymnSidebarComponent,
    HymnSidebarItemComponent,
    HymnDisplayMainComponent,
    PwaNotifComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ButtonModule,
    ChipModule,
    PaginatorModule,
    OverlayPanelModule,
    BrowserAnimationsModule,
    ToggleButtonModule,
    InputNumberModule,
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
