import { ListEventsComponent } from './../pages/event/list-events/list-events.component';
import { EventNavComponent } from './components/event-nav/event-nav.component';
import { NewEventComponent } from './../pages/event/new-event/new-event.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [HomeComponent,NewEventComponent,EventNavComponent,ListEventsComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule, FontAwesomeModule, NgxMaskModule.forChild(),NgbModule]
})
export class HomeModule {}
