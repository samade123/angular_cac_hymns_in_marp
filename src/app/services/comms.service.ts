import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Result, SimpleHymnItem } from './../test-interface';


@Injectable({
  providedIn: 'root'
})
export class CommsService {
  observer = new Subject();
  public subscriber$ = this.observer.asObservable();

  emitHymnData(data: Result) {
    this.observer.next(data);
  }
  constructor() { }
}
