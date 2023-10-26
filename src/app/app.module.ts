import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GrabNotiondbService } from './grab-notiondb.service';

@NgModule({
  declarations: [AppComponent],
  // imports: [BrowserModule, AppRoutingModule],
  imports: [BrowserModule],
  providers: [GrabNotiondbService],
  bootstrap: [AppComponent],
})
export class AppModule {}
