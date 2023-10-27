import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GrabNotiondbService {
  constructor(private http: HttpClient) {}

  getFunctionData(functionName: string) {
    return this.http.get(`http://localhost:3000/${functionName}`).pipe(
      catchError((error) => {
        console.log(error);
        return throwError('Error');
      })
    );
  }
}

// import { HttpClient, HttpHeaders } from '@angular/common/http';

// const headers = new HttpHeaders({
//   'Notion-Version': '2022-06-28',
//   'Authorization': `Bearer YOUR_API_KEY`,
//   'Accept': '*/*',
//   'Cache-Control': 'no-cache',
//   'Host': 'api.notion.com',
//   'Accept-Encoding': 'gzip, deflate, br',
//   'Connection': 'keep-alive',
// });

// constructor(private httpClient: HttpClient) {}

// async getPages(databaseId: string): Promise<Page[]> {
//   const response = await this.httpClient.get<Page[]>(
//     `https://api.notion.com/v1/databases/${databaseId}/pages`,
//     { headers }
//   );

//   return response.data;
// }
