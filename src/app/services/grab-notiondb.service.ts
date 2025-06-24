import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {
  Result,
  PreFetchHymn,
  RequestOptions,
  FetchedHymn,
  Properties,
} from '../test-interface';
import { IndexDbManagerService } from './index-db-manager.service';

@Injectable({
  providedIn: 'root',
})
export class GrabNotiondbService {
  constructor(
    private http: HttpClient, // private storageManagerService: StorageManagerService
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
          result.properties['Name']['rich_text'][0] &&
          result.properties['Number']['title'][0]
      )
      .map((result) => {
        const name: string = result.properties['Name']['rich_text'][0]
          ? result.properties['Name']['rich_text'][0]['plain_text']
          : 'n/a';

        return {
          id: result.id,
          name,
          last_edited_time: result.last_edited_time,
          hymnNumber: result.properties['Number']['title'][0]['plain_text'],
          url: result.properties['Files & media']['files'][0]['file']['url'],
        };
      });
  }

  isSimpleHymn(value: any): value is PreFetchHymn {
    return (
      typeof value === 'object' &&
      'id' in value &&
      typeof value.id === 'string' &&
      'name' in value &&
      typeof value.name === 'string' &&
      'last_edited_time' in value &&
      value.last_edited_time instanceof Date &&
      'hymnNumber' in value &&
      typeof value.hymnNumber === 'number'
    );
  }

  isResult(value: any): value is Result {
    return (
      typeof value === 'object' &&
      'parent' in value &&
      'last_edited_time' in value
    );
  }

  getMarpFile(s3Url: string) {
    // return this.http.get(`api/getMarpFile.mjs?url=${s3Url}`).pipe(
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
      const result = await response.text();

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getHymn(simpleHymn: PreFetchHymn) {
    console.log('checking');
    simpleHymn.hymnNumber;
    if (simpleHymn.url) {
      // if (this.hymnDict[simpleHymn.hymnNumber]) {
      // console.log('does the hymnexists',await this.dbStorageService.doesHymnExist(simpleHymn.hymnNumber))
      if (await this.dbStorageService.doesHymnExist(simpleHymn.hymnNumber)) {
        return;
      } else {
        this.getMarp(simpleHymn.url)
          .then(async (file) => {
            // console.log(file, 'file for this hymn')
            // this.renderMarp();
            // this.storageService.storeData('hymn-dict', this.hymnDict);
            let hymnItem = this.simplifyHymnItem(simpleHymn, file);
            await this.dbStorageService.storeData('simpleHymnItems', hymnItem);
          })
          .catch((err) => {
            console.error(err);
            // this.failedFetch.emit();
          });
      }
    }
  }
}
