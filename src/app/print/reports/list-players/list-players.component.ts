import { Ordering } from './../../../_interfaces/_enums/_ordering';
import { Tournament } from './../../../_interfaces/tournament';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '../../../core/services';

@Component({
  selector: 'app-list-players',
  templateUrl: './list-players.component.html',
  styleUrls: ['./list-players.component.scss']
})
export class ListPlayersComponent implements OnInit {

  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute,
  ) {
    this.tournament_uuid = this.route.snapshot.paramMap.get('tournament_uuid');
    this.get();
  }

  tournament_uuid;
  tournament;
  players = [];


  has_internal_rating = false;
  has_xadrezsuico_rating = false;
  has_national_rating = false;
  has_fide_rating = false;

  ngOnInit(): void {
  }


  async get(){
    let tournament_request = await this.electronService.ipcRenderer.invoke("controller.tournaments.get",this.tournament_uuid);
    if(tournament_request.ok === 1){
      this.tournament = tournament_request.tournament;

      for(let ordering of tournament_request.tournament.ordering_sequence){
        switch(ordering){
          case Ordering.INTERNAL_RATING:
            this.has_internal_rating = true;
            break;
          case Ordering.XADREZSUICO_RATING:
            this.has_xadrezsuico_rating = true;
            break;
          case Ordering.NATIONAL_RATING:
            this.has_national_rating = true;
            break;
          case Ordering.FIDE_RATING:
            this.has_fide_rating = true;
            break;
        }
      }

      let players_request = await this.electronService.ipcRenderer.invoke("controller.players.listByTournament",this.tournament_uuid,[Ordering.START_NUMBER,Ordering.ALPHABETICAL]);
      if(players_request.ok == 1){
        this.players = players_request.players;
      }
    }
  }

}
