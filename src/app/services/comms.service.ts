import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Result, SimpleHymn, SimpleHymnItem } from './../test-interface';

@Injectable({
  providedIn: 'root',
})
export class CommsService {
  observer = new Subject();
  public subscriber$ = this.observer.asObservable();

  mainAppObserver = new Subject();
  public mainAppSubscriber$ = this.mainAppObserver.asObservable();


  emitHymnData(data: Result) {
    this.observer.next(data);
  }

  emitSimpleHymnData(data: { type: string; value: SimpleHymn }){
    this.observer.next(data);
  }

  emitFullscreen(screenState: { type: string; value: Boolean }) {
    this.observer.next(screenState);
  }

  emitHymnId(
    hymnId: { type: string; value: string } = {
      type: 'hymnId',
      value: '',
    }
  ) {
    this.observer.next(hymnId);
  }

  emitHymnIdFromSidebar(
    hymnId: { type: string; value: string } = {
      type: 'hymnId',
      value: '',
    }
  ) {
    console.log('emiiing from sidebar')
    this.mainAppObserver.next(hymnId);
  }


  emitFromWebWorker(webWorkerStatus: {
    type: String,
    status: String,
  }): void {
    this.mainAppObserver.next(webWorkerStatus);

  }
  emitIdFromMainChild(id: {
    type: String,
    value: String,
  }): void {
    this.mainAppObserver.next(id);

  }
  constructor() {}
}
