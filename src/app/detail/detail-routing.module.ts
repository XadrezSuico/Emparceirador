import { DashboardEventComponent } from './../pages/event/dashboard-event/dashboard-event.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DetailComponent } from './detail.component';
import { PrintLayoutComponent } from '../print/print-layout/print-layout.component';
import { ListPlayersComponent } from '../print/reports/list-players/list-players.component';

const routes: Routes = [
  {
    path: 'print',
    component: PrintLayoutComponent,
    // children: [
    //   { path: 'players', component: ListPlayersComponent }
    // ]
    children: [
      {
        path: 'tournament/:tournament_uuid',
        children: [
          { path: 'players', component: ListPlayersComponent }
        ]
      }
    ]
  },
  {
    path: 'detail',
    component: DetailComponent
  },

  {
    path: 'event/:uuid/dashboard',
    component: DashboardEventComponent
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailRoutingModule {}
