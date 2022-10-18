import { DashboardEventComponent } from './../pages/event/dashboard-event/dashboard-event.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DetailComponent } from './detail.component';

const routes: Routes = [
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
