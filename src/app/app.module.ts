import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GrabNotiondbService } from './grab-notiondb.service';
import { HttpClientModule } from '@angular/common/http';
import { StorageManagerService } from './storage-manager.service';

@NgModule({
  declarations: [AppComponent],
  // imports: [BrowserModule, AppRoutingModule],
  imports: [BrowserModule, HttpClientModule],
  providers: [GrabNotiondbService, StorageManagerService],
  bootstrap: [AppComponent],
})
export class AppModule {}
