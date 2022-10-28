import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '../../../core/services';

@Component({
  selector: 'app-list-standings',
  templateUrl: './list-standings.component.html',
  styleUrls: ['./list-standings.component.scss']
})
export class ListStandingsComponent implements OnInit {

  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute,
  ) {
    this.tournament_uuid = this.route.snapshot.paramMap.get('tournament_uuid');
    this.round_uuid = this.route.snapshot.paramMap.get('round_uuid');
    this.category_uuid = this.route.snapshot.paramMap.get('category_uuid');
    this.get();
  }

  tournament_uuid;
  round_uuid;
  category_uuid;
  tournament;
  round;
  category;
  standings = [];
  tiebreaks = [];

  ngOnInit() {
  }

  async get(){
    let tournament_request = await this.electronService.ipcRenderer.invoke("controller.tournaments.get",this.tournament_uuid);
    if(tournament_request.ok === 1){
      this.tournament = tournament_request.tournament;
      let round_request = await this.electronService.ipcRenderer.invoke("controller.rounds.get",this.round_uuid);
      if(round_request.ok === 1){
        this.round = round_request.round;

        if(this.category_uuid === "ALL"){
          let standings_request = await this.electronService.ipcRenderer.invoke("controller.standings.listFromRoundNumber", this.tournament.uuid, this.round.number);
          if(standings_request.ok){
            this.standings = standings_request.standings;
          }
        }else{
          let category_request = await this.electronService.ipcRenderer.invoke("controller.categories.get",this.category_uuid);
          if(category_request.ok === 1){
            this.category = category_request.category;
            let standings_request = await this.electronService.ipcRenderer.invoke("controller.standings.listFromCategoryAndRoundNumber", this.tournament.uuid, this.category.uuid, this.round.number);
            if(standings_request.ok){
              this.standings = standings_request.standings;
            }
          }
        }


        let retorno = await this.electronService.ipcRenderer.invoke("controller.tiebreaks.getFromList", this.tournament.tiebreaks);
        console.log(retorno);
        if(retorno.ok){
          this.tiebreaks = retorno.tiebreaks;
        }
      }
    }
  }

}
