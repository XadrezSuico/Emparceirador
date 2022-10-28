import { ListStandingsComponent } from './../print/reports/list-standings/list-standings.component';
import { ListPairingsComponent } from './../print/reports/list-pairings/list-pairings.component';
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
          { path: 'players', component: ListPlayersComponent },
          { path: 'pairings/:round_uuid', component: ListPairingsComponent },
          { path: 'standings/:round_uuid/:category_uuid', component: ListStandingsComponent },
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
