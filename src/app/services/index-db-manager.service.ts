import { Injectable } from '@angular/core';
import { SimpleHymnItem, SimpleHymn } from './../test-interface';

import Dexie, { Table } from 'dexie';
import { db } from './../db'; // You get a db with property table1 attached (because the schema is declared)

@Injectable({
  providedIn: 'root',
})
export class IndexDbManagerService {
  simpleHymnItems: Table<SimpleHymnItem, number>;
  simpleHymns: Table<SimpleHymn, number>;
  // worker = new Worker(
  //   new URL('../web-workers/db-web-worker.worker.ts', import.meta.url)
  // );

  constructor() {}

  async storeData(
    table: string,
    hymn: SimpleHymn | SimpleHymnItem
  ): Promise<void> {
    await db.on('ready', () => {});
    await db.table(table).put(hymn);
  }

  async logDb(): Promise<void> {
    await db.table('simpleHymns').each((hymn) => {
      console.log(hymn);
    });
  }
  async returnAll(): Promise<SimpleHymn[]> {
    const hymns = await db.table('simpleHymns').orderBy('hymnNumber').toArray()
    return hymns
  }

  async getLastFiveHymns(): Promise<SimpleHymnItem[]> {
    await db.on('ready', () => {});
    const hymns = await db
      .table('simpleHymnItems')
      .orderBy('last_used_time')
      .reverse()
      .limit(5)
      .toArray();
    return hymns;
  }

  async getHymnItem(
    hymnNumber: string,
    table: string = 'simpleHymnItems'
  ): Promise<SimpleHymnItem> {
    const hymnItem = await db
      .table(table)
      .get({ hymnNumber: hymnNumber });
    if (hymnItem) {
      return hymnItem;
    } else {
      return {
        id: 'na',
        name: 'na',
        last_used_time: new Date(),
        hymnNumber: 'na',
        marp: 'na',
      };
    }
  }

  async updateHymnLastUsed(hymnItem: SimpleHymnItem): Promise<void> {
    hymnItem.last_used_time = new Date();
    await db.table('simpleHymnItems').put(hymnItem);
  }

  async addSimpleHymn(hymn: SimpleHymn): Promise<void> {
    await db.table('simpleHymns').put(hymn);
  }

  // async removeData(key: string): Promise<void> {
  //   await this.table('data').delete(key);
  // }

  async doesHymnExist(hymnNumber: string): Promise<boolean> {
    await db.on('ready', () => {});
    const count = await db
      .table('simpleHymnItems')
      .where('hymnNumber')
      .equals(hymnNumber)
      .count();
    return count > 0;
  }
  async listSimpleHymns(hymnNumber: string): Promise<SimpleHymn[]> {
    await db.on('ready', () => {});
    return await db
      .table('simpleHymns')
      .filter((hymn) => hymn.hymnNumber.includes(hymnNumber))
      .toArray();
  }

  // async clearAll(): Promise<void> {
  //   await this.table('data').clear();
  // }

  // async getData(key: string): Promise<any | null> {
  //   const data = await this.table('data').get(key);
  //   return data;
  // }

  storeNewHymnsList(hymnList: SimpleHymn[]): void {
    let worker = new Worker(
      new URL('../web-workers/db-web-worker.worker.ts', import.meta.url)
    );
    worker.postMessage({ data: hymnList, type: 'bulkPut' });
  }
}
// export const db = new IndexDbManagerService();
