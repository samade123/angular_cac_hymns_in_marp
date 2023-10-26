import { Component } from '@angular/core';
import { GrabNotiondbService } from './grab-notiondb.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'marp-hymns';

  // constructor(private service: GrabNotiondbService) {
  //   // service.logNotionKeys();
  // }
}
