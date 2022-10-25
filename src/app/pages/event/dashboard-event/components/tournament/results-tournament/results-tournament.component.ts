import { Category } from './../../../../../../_interfaces/category';
import { Tournament } from './../../../../../../_interfaces/tournament';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ElectronService } from '../../../../../../../app/core/services';

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

  categories:Array<Category> = [];

  category_index_selected = 0;

  standings = [];

  tiebreaks = [];

  constructor(
    private electronService: ElectronService,
  ) { }

  ngOnInit() {
    this.get();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.get();
  }

  async get(){
    let tournament_request = await this.electronService.ipcRenderer.invoke("controller.tournaments.get", this.tournament.uuid);
    if(tournament_request.ok === 1){
      this.internal_tournament = tournament_request.tournament;


      this.categories = [];

      this.categories[this.categories.length] = {
        uuid:"ALL",
        name:"Geral"
      };

      for(let category of this.internal_tournament.categories){
        this.categories[this.categories.length] = category;
      }

      await this.getTiebreaks();
      await this.getStandings();
    }
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
