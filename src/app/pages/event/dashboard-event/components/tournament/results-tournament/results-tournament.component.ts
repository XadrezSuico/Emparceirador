import { Category } from './../../../../../../_interfaces/category';
import { Tournament } from './../../../../../../_interfaces/tournament';
import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { ElectronService } from '../../../../../../../app/core/services';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-results-tournament',
  templateUrl: './results-tournament.component.html',
  styleUrls: ['./results-tournament.component.scss']
})
export class ResultsTournamentComponent implements OnInit, OnChanges {

  @Input()
  tournament:Tournament;

  internal_tournament:Tournament;

  @Input()
  selected_round_number:number = 0;

  @Output()
  is_requesting_emmiter = new EventEmitter<boolean>();

  categories:Array<Category> = [];

  category_index_selected = 0;

  standings = [];

  tiebreaks = [];

  is_requesting = false;

  constructor(
    private electronService: ElectronService,
  ) { }

  ngOnInit() {
    if(!this.is_requesting){
      this.get();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(!this.is_requesting){
      this.get();
    }
  }

  async get(){
    this.is_requesting = true;
    this.is_requesting_emmiter.emit(true);
    let tournament_request = await this.electronService.ipcRenderer.invoke("controller.tournaments.get", this.tournament.uuid);
    if(tournament_request.ok === 1){
      this.internal_tournament = tournament_request.tournament;

      console.log(this.internal_tournament);


      this.categories = [];

      this.categories[this.categories.length] = {
        uuid:"ALL",
        name:"Geral"
      };

      if(this.internal_tournament.categories){
        for(let category of this.internal_tournament.categories){
          this.categories[this.categories.length] = category;
        }
      }

      await this.getTiebreaks();

      let tournament_update_standings_request = await this.electronService.ipcRenderer.invoke("controller.rounds.updateStandingsFromTournament", this.tournament.uuid, this.selected_round_number, this.selected_round_number);
      if(tournament_update_standings_request.ok === 1){
        await this.getStandings();
      }else{
        Swal.fire({
          title: 'Erro!',
          text: tournament_update_standings_request.message,
          icon: 'error',
          confirmButtonText: 'Fechar'
        });
      }
    }
    this.is_requesting_emmiter.emit(false);
    this.is_requesting = false;
  }


  async onCategoryChange(){
    await this.getStandings();
  }

  async getStandings(){
    if(this.internal_tournament){
      let category = this.categories[this.category_index_selected];
      if(category.uuid === "ALL"){
        if(this.selected_round_number > 0){
          let retorno = await this.electronService.ipcRenderer.invoke("controller.standings.listFromRoundNumber", this.internal_tournament.uuid, this.selected_round_number);
          if(retorno.ok){
            this.standings = retorno.standings;
          }
        }else{
          this.standings = [];
        }
      }else{
        if(this.selected_round_number > 0){
          let category = this.categories[this.category_index_selected];
          let retorno = await this.electronService.ipcRenderer.invoke("controller.standings.listFromCategoryAndRoundNumber", this.internal_tournament.uuid, category.uuid, this.selected_round_number);
          if(retorno.ok){
            this.standings = retorno.standings;
          }
        }else{
          this.standings = [];
        }
      }
    }
  }

  async getTiebreaks(){
    if(this.internal_tournament){
      let retorno = await this.electronService.ipcRenderer.invoke("controller.tiebreaks.getFromList", this.internal_tournament.tiebreaks);
      console.log(retorno);
      if(retorno.ok){
        this.tiebreaks = retorno.tiebreaks;
      }
    }
  }

}
