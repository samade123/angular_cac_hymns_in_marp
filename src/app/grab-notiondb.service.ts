import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { StorageManagerService } from './storage-manager.service';

export interface SimpleHymn {
  id: string;
  name: string;
  last_edited_by: string;
}

@Injectable({
  providedIn: 'root',
})
export class GrabNotiondbService {
  constructor(
    private http: HttpClient,
    // private storageManagerService: StorageManagerService
  ) {}



  getFunctionData(functionName: string) {
    return this.http.get(`http://localhost:3000/${functionName}`).pipe(
      catchError((error) => {
        console.log(error);
        return throwError('Error');
      })
    );
  }

  //   simplifyHymns(results: NotionPage[]): SimpleHymn[] {
  //     return results.map((result) => {
  //       // let name: string | notion.TitleProperty = result.properties.Name;
  //       const name: ResultsProperty  = result.properties
  //       // const name: ResultsProperty  = result.properties.Name.rich_text[0].text.content;

  //       const last_edited_by = result.last_edited_by.id;

  //       return {
  //         id: result.id,
  //         name,
  //         last_edited_by,
  //       };
  //     });
  //   }
  //   private isTitleProperty(property: any): property is notion.TitleProperty {
  //     return property.type === 'title';
  //   }
}
