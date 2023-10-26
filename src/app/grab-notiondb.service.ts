import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GrabNotiondbService {
  constructor(private http: HttpClient) {}

  // async getFunctionData(functionName: string): Promise<any> {
  //   const response = await this.http.get(
  //     `http://localhost:3000/${functionName}`
  //   );
  //   return response.data;
  // }
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
