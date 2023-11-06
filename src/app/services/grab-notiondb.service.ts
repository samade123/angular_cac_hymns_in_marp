import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {
  Result,
  SimpleHymn,
  RequestOptions,
  SimpleHymnItem,
} from '../test-interface';

@Injectable({
  providedIn: 'root',
})
export class GrabNotiondbService {
  constructor(
    private http: HttpClient // private storageManagerService: StorageManagerService
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
  simpleHymnsTrackByFn(index: number, hymn: SimpleHymn): string {
    return hymn.id;
  }
  simpleHymnItemsTrackByFn(index: number, hymn: SimpleHymnItem): string {
    return hymn.id;
  }

  simplifyHymnItem(result: Result, marp: string): SimpleHymnItem {
    const name: string = result.properties['Name']['rich_text'][0]
      ? result.properties['Name']['rich_text'][0]['plain_text']
      : 'n/a';
    return {
      id: result.id,
      name,
      last_used_time: new Date(),
      marp,
      hymnNumber: result.properties['Number']['title'][0]['plain_text'],
    };
  }

  simplifyHymns(results: Result[]): SimpleHymn[] {
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
        };
      });
  }

  isSimpleHymn(value: any): value is SimpleHymn {
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
}
