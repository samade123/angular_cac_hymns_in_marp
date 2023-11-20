import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { HymnDisplayMainComponent } from './hymn-display-main/hymn-display-main.component';

const routes: Routes = [
  { path: 'home', component: HymnDisplayMainComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    provideRouter(routes, withComponentInputBinding()),
  ]
})
export class AppRoutingModule { }
