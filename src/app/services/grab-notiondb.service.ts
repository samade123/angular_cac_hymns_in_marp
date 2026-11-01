import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import {
  Result,
  PreFetchHymn,
  RequestOptions,
  FetchedHymn,
} from '../test-interface';
import { IndexDbManagerService } from './index-db-manager.service';
import { padHymnNumber } from './hymn-utils';

@Injectable({
  providedIn: 'root',
})
export class GrabNotiondbService {
  constructor(
    private http: HttpClient,
    private dbStorageService: IndexDbManagerService
  ) {}

  getFunctionData(functionName: string) {
    return this.http.get(`${functionName}`).pipe(
      catchError((error) => {
        console.log(error);
        return throwError('Error');
      })
    );
  }

  notionPageTrackByFn(index: number, result: Result): string {
    return result.id;
  }
  simpleHymnsTrackByFn(index: number, hymn: PreFetchHymn): string {
    return hymn.id;
  }
  simpleHymnItemsTrackByFn(index: number, hymn: FetchedHymn): string {
    return hymn.id;
  }

  simplifyHymnItem(simpleHymn: PreFetchHymn, marp: string): FetchedHymn {
    const name: string = simpleHymn.name ? simpleHymn.name : 'n/a';
    return {
      id: simpleHymn.id,
      name,
      last_used_time: new Date(),
      marp,
      hymnNumber: simpleHymn.hymnNumber,
    };
  }

  simplifyHymns(results: Result[]): PreFetchHymn[] {
    return results
      .filter(
        (result) =>
          result &&
          result.properties &&
          result.properties['Name'] &&
          result.properties['Name']['rich_text'] &&
          result.properties['Name']['rich_text'][0] &&
          result.properties['Number'] &&
          result.properties['Number']['title'] &&
          result.properties['Number']['title'][0]
      )
      .map((result) => {
        const richTextName = result.properties['Name']['rich_text'][0];
        const name: string = richTextName && richTextName['plain_text']
          ? richTextName['plain_text']
          : 'n/a';

        const filesMedia = result.properties['Files & media'];
        const files = filesMedia && filesMedia['files'];
        const firstFile = files && files[0];
        let url = '';
        if (firstFile) {
          if (firstFile['file']) {
            url = firstFile['file']['url'] || '';
          } else if (firstFile['external']) {
            url = firstFile['external']['url'] || '';
          }
        }

        const rawNumber = result.properties['Number']['title'][0]['plain_text'] || '';
        const hymnNumber = padHymnNumber(rawNumber);

        return {
          id: result.id,
          name,
          last_edited_time: result.last_edited_time,
          hymnNumber: hymnNumber,
          url: url,
        };
      });
  }

  isSimpleHymn(value: any): value is PreFetchHymn {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      typeof value.id === 'string' &&
      'name' in value &&
      typeof value.name === 'string' &&
      'last_edited_time' in value &&
      value.last_edited_time instanceof Date &&
      'hymnNumber' in value &&
      typeof value.hymnNumber === 'string'
    );
  }

  isResult(value: any): value is Result {
    return (
      typeof value === 'object' &&
      value !== null &&
      'parent' in value &&
      'last_edited_time' in value
    );
  }

  getMarpFile(s3Url: string) {
    return this.http.get(`${s3Url}`).pipe(
      catchError((error) => {
        console.log(error);
        return throwError('Error');
      })
    );
  }

  async getMarp(s3Url: string): Promise<string> {
    const requestOptions: RequestOptions = {
      method: 'GET',
      redirect: 'follow',
    };

    try {
      const response = await fetch(s3Url, requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.text();

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getHymn(simpleHymn: PreFetchHymn) {
    console.log('checking');
    if (simpleHymn.url) {
      if (await this.dbStorageService.doesHymnExist(simpleHymn.hymnNumber)) {
        return;
      } else {
        this.getMarp(simpleHymn.url)
          .then(async (file) => {
            let hymnItem = this.simplifyHymnItem(simpleHymn, file);
            await this.dbStorageService.storeData('simpleHymnItems', hymnItem);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }
}