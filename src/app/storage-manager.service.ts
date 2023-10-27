import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageManagerService {


  constructor() {}

  storeData(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeData(key: string): void {
    localStorage.removeItem(key);
  }

  doesDataExist(key: string):Boolean {
    return localStorage.getItem(key) ? true : false;
  }

  clearAll() {
    localStorage.clear();
  }

  getData(key: string): Object | null {
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    return data ? data : null;
  }

}
