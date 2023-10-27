import { Component, OnInit } from '@angular/core';
import { GrabNotiondbService } from './grab-notiondb.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'marp-hymns';

  constructor(private service: GrabNotiondbService) {}

  ngOnInit(): void {
    this.service.getFunctionData('api/getNotion.mjs').subscribe((res) => {
      console.log(res);
    });
  }
}
