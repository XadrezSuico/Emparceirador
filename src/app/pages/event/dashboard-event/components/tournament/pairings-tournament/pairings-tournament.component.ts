import { Tournament } from './../../../../../../_interfaces/tournament';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription, throwIfEmpty } from 'rxjs';
import { ElectronService } from '../../../../../../core/services';
import { Pairing } from '../../../../../../_interfaces/pairing';

@Component({
  selector: 'app-pairings-tournament',
  templateUrl: './pairings-tournament.component.html',
  styleUrls: ['./pairings-tournament.component.scss']
})
export class PairingsTournamentComponent implements OnInit, OnDestroy, OnChanges {

  @Input()
  tournament_uuid;

  @Output()
  new_round_emitter = new EventEmitter<string>();

  constructor(
    private electronService: ElectronService,
    private modalService: NgbModal,
    private ref: ChangeDetectorRef
  ) { }

  @Input()
  tournament:Tournament;

  @Input()
  last_round_number:number = 0;

  @Input()
  selected_round_number:number = 0;

  selected_round_status = {
    can_pairing: false,
    message: "-"
  }

  pairings:Array<Pairing> = [];

  ngOnInit() {
    this.statusSelectedRound();
  }


  ngOnDestroy() {

  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("changed");
    console.log(changes);
    this.statusSelectedRound();

    this.getPairings();
  }

  async generateRound(){
    let  retorno = await this.electronService.ipcRenderer.invoke("model.rounds.generateRound", this.tournament_uuid);
    if(retorno.ok){
      this.new_round_emitter.emit(retorno.data.uuid);

      this.last_round_number = retorno.data.number;

      this.getPairings();
    }
  }

  // newRoundEvent(round_number:number){
  //   this.last_round_number = Number(round_number);
  //   this.ref.markForCheck();
  // }

  // roundChangedEvent(round_number:number){
  //   this.selected_round_number = Number(round_number);
  //   this.ref.markForCheck();
  // }

  async canGenerateNewRound(){
      return this.selected_round_status.can_pairing;
  }

  async statusSelectedRound(){
    if(Number(this.selected_round_number) === Number(this.last_round_number)){
      if(Number(this.last_round_number) === 0){
        this.selected_round_status = {
          can_pairing: true,
          message: "Torneio apto para primeiro emparceiramento"
        }
      }else if(Number(this.tournament.rounds_number) === this.last_round_number){
        this.selected_round_status = {
          can_pairing: false,
          message: "Última rodada - Não é mais possível efetuar emparceiramentos."
        }
      }else{
        let  retorno = await this.electronService.ipcRenderer.invoke("model.rounds.canGenerateNewRound", this.tournament_uuid);
        if(retorno.ok){
          if(retorno.result){
            this.selected_round_status = {
              can_pairing: true,
              message: "Apto para emparceiramento"
            }
          }else{
            this.selected_round_status = {
              can_pairing: false,
              message: retorno.message
            }
          }
        }else{
          this.selected_round_status = {
            can_pairing: false,
            message: "-"
          }
        }
      }
    }else{
      this.selected_round_status = {
        can_pairing: false,
        message: "A rodada não é a mais atual - Altere para a rodada mais atual para que seja possível emparceirar."
      }
    }
  }

  async getPairings(){
    this.row_selected = -1;

    let retorno = await this.electronService.ipcRenderer.invoke("model.rounds.getByNumber", this.tournament_uuid, this.selected_round_number);
    if(retorno.ok === 1){
      let round = retorno.round;
      let result_pairings = await this.electronService.ipcRenderer.invoke("model.pairings.listByRound", round.uuid);
      if(result_pairings.ok === 1){
        this.pairings = result_pairings.pairings;

        this.updatePlayersName();
      }
    }
  }

  async updatePlayersName(){
    let i = 0;
    for(let pairing of this.pairings){
      console.log(pairing);
      if(pairing.player_a_uuid){
        let return_player_a = await this.electronService.ipcRenderer.invoke("model.players.get", pairing.player_a_uuid);
        if(return_player_a.ok === 1){
          this.pairings[i].player_a_name = return_player_a.player.name;
        }
      }
      if(pairing.player_b_uuid){
        let return_player_b = await this.electronService.ipcRenderer.invoke("model.players.get", pairing.player_b_uuid);
        if(return_player_b.ok === 1){
          this.pairings[i].player_b_name = return_player_b.player.name;
        }
      }
      i++;
    }
  }

  getPairingResult(pairing){
    if(pairing.player_a_result || pairing.player_b_result){
      if(pairing.is_bye){
        return "".concat(String(pairing.player_a_result)).concat("");
      }
      if(pairing.player_a_result && pairing.player_b_wo){
        return "+ | -";
      }
      if(pairing.player_b_result && pairing.player_a_wo){
        return "- | +";
      }
      return "".concat(String(pairing.player_a_result)).concat(" | ").concat(String(pairing.player_b_result));
    }else if(pairing.player_a_wo && pairing.player_b_wo){
      return "- | -"
    }else{
      return "|";
    }
  }



  row_selected = -1;

  selectRow(number){
    if(this.row_selected != number){
      this.row_selected = number;
    }else{
      this.row_selected = -1;
    }
  }

  setEmptyResult(){
    if(this.row_selected >= 0 && this.row_selected < this.pairings.length){
      if(!this.pairings[this.row_selected].is_bye){
        this.pairings[this.row_selected].player_a_result = null;
        this.pairings[this.row_selected].player_b_result = null;
        this.pairings[this.row_selected].player_a_wo = null;
        this.pairings[this.row_selected].player_b_wo = null;

        this.updateResult(this.pairings[this.row_selected]);
      }
    }
  }

  setResult(player_a,player_b){
    if(this.row_selected >= 0 && this.row_selected < this.pairings.length){
      if(!this.pairings[this.row_selected].is_bye){
        this.pairings[this.row_selected].player_a_result = player_a;
        this.pairings[this.row_selected].player_b_result = player_b;
        this.pairings[this.row_selected].player_a_wo = false;
        this.pairings[this.row_selected].player_b_wo = false;

        this.updateResult(this.pairings[this.row_selected]);
      }
    }
  }
  setResultWO(player_a,player_b){
    if(this.row_selected >= 0 && this.row_selected < this.pairings.length){
      if(!this.pairings[this.row_selected].is_bye){
        this.pairings[this.row_selected].player_a_result = player_a;
        this.pairings[this.row_selected].player_b_result = player_b;
        this.pairings[this.row_selected].player_a_wo = (player_a) ? false : true;
        this.pairings[this.row_selected].player_b_wo = (player_b) ? false : true;

        this.updateResult(this.pairings[this.row_selected]);
      }
    }
  }

  async updateResult(pairing){
    let return_update_result = await this.electronService.ipcRenderer.invoke("model.pairings.update", pairing);
    if(return_update_result.ok === 1){
      this.statusSelectedRound();
      return {ok:1,error:0}
    }
    return return_update_result;
  }
}
