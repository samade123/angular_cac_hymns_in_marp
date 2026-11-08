# MarpHymns

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

Notion only stores the **link** to each hymn's file. The Marp markdown itself lives in file storage (S3), so the app makes two requests: one for the hymn list, and one for each hymn's file.
```mermaid
flowchart LR
    N[(Notion database)] -->|1. Query all pages| F[api/getNotionQuery.js]
    F -->|2. Hymn list with file URLs| A[App]
    A -->|3. Save list| T1[(simpleHymns)]
    A -->|4. Open hymn: fetch file URL| S3[(S3 file storage)]
    S3 -->|5. Marp markdown text| A
    A -->|6. Save file| T2[(simpleHymnItems)]
    T2 --> R[Marp slides]
    E[Local editor] -->|Save Local| T3[(localHymns)]
    T3 -->|Local mode| R
```
