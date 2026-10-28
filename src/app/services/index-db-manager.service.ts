import { Injectable } from '@angular/core';
import { FetchedHymn, PreFetchHymn, DisplayHymn } from './../test-interface';

import Dexie, { Table } from 'dexie';
import { db } from './../db'; // You get a db with property table1 attached (because the schema is declared)
import { CommsService } from './comms.service';

@Injectable({
  providedIn: 'root',
})
export class IndexDbManagerService {
  simpleHymnItems: Table<FetchedHymn, number>;
  simpleHymns: Table<PreFetchHymn, number>;
  // worker = new Worker(
  //   new URL('../web-workers/db-web-worker.worker.ts', import.meta.url)
  // );

  constructor(private commService: CommsService) {}

  async storeData(
    table: string,
    hymn: PreFetchHymn | FetchedHymn,
  ): Promise<void> {
    await db.on('ready', () => {});
    await db.table(table).put(hymn);
  }

  async logDb(): Promise<void> {
    await db.table('simpleHymns').each((hymn) => {
      console.log(hymn);
    });
  }

  async getHymnItem(
    hymnNumber: string,
    table: string = 'simpleHymnItems',
  ): Promise<FetchedHymn> {
    const hymnItem = await db.table(table).get({ hymnNumber: hymnNumber });
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

  async getHymnItembyId(
    id: string,
    table: string = 'simpleHymns',
  ): Promise<PreFetchHymn> {
    await db.on('ready', () => {});
    const hymnItem = await db.table(table).get(id);
    if (hymnItem) {
      return hymnItem;
    } else {
      if (table === 'simpleHymns') {
        const localItem = await db.table('localHymns').get(id);
        if (localItem) {
          return {
            id: localItem.id,
            name: localItem.name || 'n/a',
            last_edited_time: localItem.last_edited_time || new Date(),
            hymnNumber: localItem.hymnNumber,
            url: '',
          };
        }
      }
      return {
        id: 'na',
        name: 'na',
        last_edited_time: new Date(),
        hymnNumber: 'na',
        url: '',
      };
    }
  }

  async getSimpleHymnByNumber(
    hymnNumber: string,
    table: string = 'simpleHymns',
  ): Promise<PreFetchHymn> {
    await db.on('ready', () => {});
    const hymnItem = await db.table(table).get({ hymnNumber: hymnNumber });
    if (hymnItem) {
      return hymnItem;
    } else {
      if (table === 'simpleHymns') {
        const localItem = await db.table('localHymns').get({ hymnNumber: hymnNumber });
        if (localItem) {
          return {
            id: localItem.id,
            name: localItem.name || 'n/a',
            last_edited_time: localItem.last_edited_time || new Date(),
            hymnNumber: localItem.hymnNumber,
            url: '',
          };
        }
      }
      return {
        id: 'na',
        name: 'na',
        last_edited_time: new Date(),
        hymnNumber: 'na',
        url: '',
      };
    }
  }

  async updateHymnLastUsed(hymnItem: FetchedHymn): Promise<void> {
    hymnItem.last_used_time = new Date();
    await db.table('simpleHymnItems').put(hymnItem);
  }

  async addSimpleHymn(hymn: PreFetchHymn): Promise<void> {
    await db.table('simpleHymns').put(hymn);
  }

  // async removeData(key: string): Promise<void> {
  //   await this.table('data').delete(key);
  // }

  async doesHymnExist(
    hymnNumber: string,
    table: string = 'simpleHymnItems',
  ): Promise<boolean> {
    await db.on('ready', () => {});
    const count = await db
      .table(table)
      .where('hymnNumber')
      .equals(hymnNumber)
      .count();
    return count > 0;
  }

  async doesHymnbyIdExist(
    id: string,
    table: string = 'simpleHymnItems',
  ): Promise<boolean> {
    await db.on('ready', () => {});
    const count = await db.table(table).where('id').equals(id).count();
    if (count > 0) return true;
    if (table === 'simpleHymns') {
      const localCount = await db.table('localHymns').where('id').equals(id).count();
      return localCount > 0;
    }
    return false;
  }

  async listSimpleHymns(searchString: string): Promise<DisplayHymn[]> {
    await db.on('ready', () => {});
    const query = (searchString || '').trim().toLowerCase();
    if (!query) {
      return [];
    }

    const [simpleHymns, localHymns, cachedHymnItems] = await Promise.all([
      db.table('simpleHymns').toArray().catch(() => [] as PreFetchHymn[]),
      db.table('localHymns').toArray().catch(() => [] as any[]),
      db.table('simpleHymnItems').toArray().catch(() => [] as FetchedHymn[]),
    ]);

    const localByNumber = new Map<string, any>();
    const localById = new Map<string, any>();
    for (const local of localHymns) {
      if (!local) continue;
      if (local.hymnNumber != null) {
        localByNumber.set(String(local.hymnNumber).trim(), local);
      }
      if (local.id != null) {
        localById.set(String(local.id), local);
      }
    }

    const cachedByNumber = new Map<string, FetchedHymn>();
    for (const item of cachedHymnItems) {
      if (!item) continue;
      if (item.hymnNumber != null) {
        cachedByNumber.set(String(item.hymnNumber).trim(), item);
      }
    }

    const isNumericQuery = /^\d+$/.test(query);
    const queryNum = isNumericQuery ? parseInt(query, 10) : null;
    const queryTokens = query.split(/\s+/).filter(Boolean);

    const evaluateMatch = (
      hymnNumberStr: string,
      nameStr: string,
      marpStr: string
    ): number | null => {
      const numLower = hymnNumberStr.toLowerCase();
      const nameLower = nameStr.toLowerCase();
      const marpLower = marpStr.toLowerCase();

      // Check numeric equivalence (e.g. searching '1' matches '001' or '01')
      const isNumHymn = /^\d+$/.test(hymnNumberStr);
      const hymnNumVal = isNumHymn ? parseInt(hymnNumberStr, 10) : null;
      if (queryNum !== null && hymnNumVal !== null && queryNum === hymnNumVal) {
        return 1; // Highest priority: exact numeric match
      }

      if (numLower === query) return 1;
      if (numLower.startsWith(query)) return 2;
      if (nameLower === query) return 3;
      if (nameLower.startsWith(query)) return 4;
      if (nameLower.includes(query)) return 5;
      if (numLower.includes(query)) return 6;

      // Check Marp file content (lyrics, verses, headings)
      if (marpLower.includes(query)) return 7;

      // Multi-token match across all fields
      if (queryTokens.length > 1) {
        const fullContent = `${numLower} ${nameLower} ${marpLower}`;
        const allTokensFound = queryTokens.every((token) => fullContent.includes(token));
        if (allTokensFound) {
          return 8;
        }
      }

      return null;
    };

    const matchedMap = new Map<string, { hymn: DisplayHymn; priority: number }>();

    // 1. Process simpleHymns (augmented with local edits and cached files)
    for (const hymn of simpleHymns) {
      if (!hymn) continue;

      const numStr = hymn.hymnNumber != null ? String(hymn.hymnNumber).trim() : '';
      const idStr = hymn.id != null ? String(hymn.id) : '';
      const nameStr = hymn.name != null ? String(hymn.name).trim() : '';

      const local = localByNumber.get(numStr) || (idStr ? localById.get(idStr) : undefined);
      const cached = cachedByNumber.get(numStr);
      const hasLocal = !!local;

      const effectiveName =
        hasLocal && local.name && local.name !== 'na' && local.name !== 'n/a'
          ? String(local.name).trim()
          : nameStr;

      const marpContent =
        hasLocal && local.marp
          ? String(local.marp)
          : cached && cached.marp
          ? String(cached.marp)
          : '';

      const matchPriority = evaluateMatch(numStr, effectiveName, marpContent);

      if (matchPriority !== null) {
        const key = numStr || idStr;
        matchedMap.set(key, {
          hymn: {
            id: hymn.id || (local ? local.id : key),
            hymnNumber: numStr,
            name: effectiveName || 'n/a',
            last_edited_time:
              hasLocal && local.last_edited_time ? local.last_edited_time : hymn.last_edited_time,
            hasLocal: hasLocal,
            url: hymn.url || '',
          },
          priority: matchPriority,
        });
      }
    }

    // 2. Process localHymns that might only exist locally (e.g. offline or custom local files)
    for (const local of localHymns) {
      if (!local) continue;

      const numStr = local.hymnNumber != null ? String(local.hymnNumber).trim() : '';
      const idStr = local.id != null ? String(local.id) : '';
      const key = numStr || idStr;

      if (matchedMap.has(key)) {
        continue;
      }

      const nameStr = local.name != null ? String(local.name).trim() : '';
      const marpStr = local.marp != null ? String(local.marp) : '';

      const matchPriority = evaluateMatch(numStr, nameStr, marpStr);

      if (matchPriority !== null) {
        matchedMap.set(key, {
          hymn: {
            id: local.id || key,
            hymnNumber: numStr,
            name: nameStr || 'n/a',
            last_edited_time: local.last_edited_time || new Date(),
            hasLocal: true,
            url: '',
          },
          priority: matchPriority,
        });
      }
    }

    // Sort: priority first, then numerical hymnNumber
    return Array.from(matchedMap.values())
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        const aNum = parseInt(a.hymn.hymnNumber, 10);
        const bNum = parseInt(b.hymn.hymnNumber, 10);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return (a.hymn.hymnNumber || '').localeCompare(b.hymn.hymnNumber || '');
      })
      .map((item) => item.hymn);
  }

  async getLastEightHymns(): Promise<FetchedHymn[]> {
    await db.on('ready', () => {});
    return (await db
      .table('simpleHymnItems')
      .orderBy('last_used_time')
      .reverse()
      .limit(8)
      .toArray()) as FetchedHymn[];

    // return hymns as FetchedHymn[];
  }

  async returnAll(offset: number = 0): Promise<PreFetchHymn[]> {
    await db.on('ready', () => {});
    return await db
      .table('simpleHymns')
      .orderBy('hymnNumber')
      .offset(offset)
      .limit(10)
      .toArray();
  }

  async getTableLength(table: string = 'simpleHymns'): Promise<number> {
    await db.on('ready', () => {});
    return await db.table(table).count();
  }

  // async clearAll(): Promise<void> {
  //   await this.table('data').clear();
  // }

  // async getData(key: string): Promise<any | null> {
  //   const data = await this.table('data').get(key);
  //   return data;
  // }

  storeNewHymnsList(hymnList: PreFetchHymn[]): void {
    let worker = new Worker(
      new URL('../web-workers/db-web-worker.worker.ts', import.meta.url),
    );
    worker.addEventListener(
      'message',
      (e: MessageEvent<{ type: string; value: any }>) => {
        // set type on data property
        if (e.data.type && e.data.type == 'successPut') {
          console.log(' sending com0lete ');
          this.commService.emitFromWebWorker({
            type: 'webworker',
            status: `Hymns Uploaded ${e.data} last id`,
          });
        }
        console.log('Message received from worker', e);
      },
      { once: true },
    );
    worker.postMessage({ data: hymnList, type: 'bulkPut' });
  }

  checkForEmptyDb(
    onEmptyDbFunc: () => void,
    onNotEmptyDbFunc: () => void,
  ): void {
    this.returnAll().then(async (arr) => {
      // check if database is loaded
      if (arr.length == 0) {
        await onEmptyDbFunc();
      } else if (arr.length > 0) {
        onNotEmptyDbFunc();
      }
    });
  }

  async getAllSimpleHymns(): Promise<PreFetchHymn[]> {
    await db.on('ready', () => {});
    return await db.table('simpleHymns').orderBy('hymnNumber').toArray();
  }

  async getAllFetchedHymns(): Promise<FetchedHymn[]> {
    await db.on('ready', () => {});
    return await db.table('simpleHymnItems').toArray();
  }

  async deleteFetchedHymn(hymnNumber: string): Promise<void> {
    await db.on('ready', () => {});
    await db.table('simpleHymnItems').where('hymnNumber').equals(hymnNumber).delete();
  }

  async saveLocalHymn(localHymn: { id: string; name: string; hymnNumber: string; marp: string; last_edited_time: Date }): Promise<void> {
    await db.on('ready', () => {});
    await db.table('localHymns').put(localHymn);
  }

  async getLocalHymn(hymnNumber: string): Promise<any | null> {
    await db.on('ready', () => {});
    const hymn = await db.table('localHymns').get({ hymnNumber: hymnNumber });
    return hymn || null;
  }

  async getAllLocalHymns(): Promise<any[]> {
    await db.on('ready', () => {});
    return await db.table('localHymns').toArray();
  }

  async deleteLocalHymn(hymnNumber: string): Promise<void> {
    await db.on('ready', () => {});
    await db.table('localHymns').where('hymnNumber').equals(hymnNumber).delete();
  }

  async doesLocalHymnExist(hymnNumber: string): Promise<boolean> {
    await db.on('ready', () => {});
    const count = await db.table('localHymns').where('hymnNumber').equals(hymnNumber).count();
    return count > 0;
  }
}
// export const db = new IndexDbManagerService();
