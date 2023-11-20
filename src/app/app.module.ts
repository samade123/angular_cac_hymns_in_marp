import { NgModule } from '@angular/core';
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

@NgModule({
  declarations: [AppComponent, HymnSidebarComponent, HymnDisplayMainComponent],
  // imports: [BrowserModule, AppRoutingModule],
  imports: [BrowserModule, HttpClientModule, FormsModule, AppRoutingModule],
  providers: [GrabNotiondbService, StorageManagerService, IndexDbManagerService],
  bootstrap: [AppComponent],
})
export class AppModule {}
