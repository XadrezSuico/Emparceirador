import { Ordering } from './../../../../../../_interfaces/_enums/_ordering';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faArrowAltCircleDown, faArrowAltCircleUp, faEdit, faListAlt, faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { faChessBoard, faMedal, faUsers, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { ElectronService } from '../../../../../../core/services';
import { Tournament } from '../../../../../../_interfaces/tournament';
import { TournamentType } from '../../../../../../_interfaces/_enums/_tournament_type';

@Component({
  selector: 'app-dashboard-tournament',
  templateUrl: './dashboard-tournament.component.html',
  styleUrls: ['./dashboard-tournament.component.scss']
})
export class DashboardTournamentComponent implements OnInit {
  players_icon = faUsers;
  pairings_icon = faChessBoard;
  results_icon = faListAlt;
  categories_icon = faMedal;
  edit_icon = faEdit;

  add_icon = faPlusCircle;
  up_icon = faArrowAltCircleUp;
  down_icon = faArrowAltCircleDown;
  x_icon = faTimesCircle;

  list_orderings = [
    {
      name: "Rating Interno",
      value: Ordering.INTERNAL_RATING
    },
    {
      name: "Rating XadrezSuíço",
      value: Ordering.XADREZSUICO_RATING
    },
    {
      name: "Rating Nacional",
      value: Ordering.NATIONAL_RATING
    },
    {
      name: "Rating FIDE",
      value: Ordering.FIDE_RATING
    },
    {
      name: "Data de Nascimento",
      value: Ordering.BORNDATE
    },
    {
      name: "Ordem Alfabética do Nome",
      value: Ordering.ALPHABETICAL
    },
  ]
  list_orderings_not_selected:Array<any> = [
  ]




  @Input()
  event_uuid;

  @Input()
  tournament_uuid;

  @Output()
  new_tournament_event_emitter = new EventEmitter<string>();

  tournament:Tournament = {
    uuid:'',
    name:'',
    tournament_type: TournamentType.SWISS,
    ordering_sequence: []
  };
  constructor(
    private electronService: ElectronService
  ) { }

  ngOnInit() {
    if(this.tournament_uuid){
      this.get();
    }
  }

  async get(){
    let  retorno = await this.electronService.ipcRenderer.invoke("model.tournaments.get", this.tournament_uuid);
    if(retorno.ok){
      this.tournament = retorno.tournament;

      this.registerNotSelectedOrdering();
    }
  }



  async save(){
    let retorno;
    if(this.tournament_uuid){
      retorno = await this.electronService.ipcRenderer.invoke("model.tournaments.update", this.tournament_uuid, this.tournament);
    }else{
      retorno = await this.electronService.ipcRenderer.invoke("model.tournaments.create", this.event_uuid, this.tournament);

      if(retorno.ok){
        this.new_tournament_event_emitter.emit(retorno.data.uuid);
      }
    }
    console.log(retorno);
  }


  getSystemType(){
    switch(this.tournament.tournament_type){
      case TournamentType.SWISS:
        return "Suíço em ".concat(String(this.tournament.rounds_number)).concat(" rodada(s)");
      case TournamentType.SCHURING:
        return "Round-Robin/Schüring/Todos-contra-todos";
    }
  }

  getTournamentStatus(){
    return "Aguardando Emparceiramento Inicial";
  }


  getOrderingName(ordering){
    switch(ordering){
      case Ordering.ALPHABETICAL:
        return "Ordem Alfabética do Nome";
      case Ordering.BORNDATE:
        return "Data de Nascimento";
      case Ordering.FIDE_RATING:
        return "Rating FIDE";
      case Ordering.INTERNAL_RATING:
        return "Rating Interno";
      case Ordering.NATIONAL_RATING:
        return "Rating Nacional";
      case Ordering.XADREZSUICO_RATING:
        return "Rating XadrezSuíço";
    }
  }

  registerNotSelectedOrdering(){
    if(!this.tournament.ordering_sequence){
      this.tournament.ordering_sequence = [];
    }

    this.list_orderings_not_selected = [];

    let orderings = [];

    for(let ordering_item of this.list_orderings){
      if(!this.tournament.ordering_sequence.includes(ordering_item.value)){
        this.list_orderings_not_selected.push(ordering_item);
      }
    }
  }


  addOrdering(ordering){
    if(this.tournament.ordering_sequence){
      if(!this.tournament.ordering_sequence.includes(ordering)){
        this.tournament.ordering_sequence.push(ordering);
      }

      this.registerNotSelectedOrdering();
    }
  }

  putToUpOrdering(i){
    if(this.tournament.ordering_sequence){
      if(i > 0){
        let item_to_put_in_up_position = this.tournament.ordering_sequence[i];
        let item_to_put_in_down_position = this.tournament.ordering_sequence[i-1];

        this.tournament.ordering_sequence[i-1] = item_to_put_in_up_position;
        this.tournament.ordering_sequence[i] = item_to_put_in_down_position;
      }
    }
  }
  putToDownOrdering(i){
    if(this.tournament.ordering_sequence){
      if(i > 0){
        let item_to_put_in_up_position = this.tournament.ordering_sequence[i+1];
        let item_to_put_in_down_position = this.tournament.ordering_sequence[i];

        this.tournament.ordering_sequence[i] = item_to_put_in_up_position;
        this.tournament.ordering_sequence[i+1] = item_to_put_in_down_position;
      }
    }
  }
  removeOrdering(i){
    if(this.tournament.ordering_sequence){
      if(i < this.tournament.ordering_sequence.length && i >= 0){
        this.tournament.ordering_sequence.splice(i,1);

        this.registerNotSelectedOrdering();
      }
    }
  }

}
