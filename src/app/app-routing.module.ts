import { NgModule } from '@angular/core';
import {
  RouterModule,
  Routes,
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import { HymnDisplayMainComponent } from './hymn-display-main/hymn-display-main.component';
import { HymnSidebarComponent } from './hymn-sidebar/hymn-sidebar.component';

const routes: Routes = [
  { path: '', component: HymnDisplayMainComponent },
  { path: 'hymns', component: HymnSidebarComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [provideRouter(routes, withComponentInputBinding())],
})
export class AppRoutingModule {}
