import { ResultsTournamentComponent } from './../pages/event/dashboard-event/components/tournament/results-tournament/results-tournament.component';
import { PairingsTournamentComponent } from './../pages/event/dashboard-event/components/tournament/pairings-tournament/pairings-tournament.component';
import { CategoriesTournamentComponent } from './../pages/event/dashboard-event/components/tournament/categories-tournament/categories-tournament.component';
import { PlayersTournamentComponent } from './../pages/event/dashboard-event/components/tournament/players-tournament/players-tournament.component';
import { DashboardTournamentComponent } from './../pages/event/dashboard-event/components/tournament/dashboard-tournament/dashboard-tournament.component';
import { TournamentsComponent } from './../pages/event/dashboard-event/components/tournament/tournaments/tournaments.component';
import { EventDashboardNavComponent } from './components/event-dashboard-nav/event-dashboard-nav.component';
import { DashboardEventComponent } from './../pages/event/dashboard-event/dashboard-event.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailRoutingModule } from './detail-routing.module';

import { DetailComponent } from './detail.component';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxMaskModule } from 'ngx-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    DetailComponent,
    DashboardEventComponent,
    EventDashboardNavComponent,
    TournamentsComponent,
    DashboardTournamentComponent,
    PlayersTournamentComponent,
    CategoriesTournamentComponent,
    PairingsTournamentComponent,
    ResultsTournamentComponent
  ],
  imports: [CommonModule, SharedModule, DetailRoutingModule,FontAwesomeModule,NgxMaskModule.forChild(),NgbModule]
})
export class DetailModule {}
