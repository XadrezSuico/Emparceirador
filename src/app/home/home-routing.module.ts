import { ListEventsComponent } from './../pages/event/list-events/list-events.component';
import { NewEventComponent } from './../pages/event/new-event/new-event.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },

  {
    path: 'event/new',
    component: NewEventComponent
  },
  {
    path: 'event/list',
    component: ListEventsComponent
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
