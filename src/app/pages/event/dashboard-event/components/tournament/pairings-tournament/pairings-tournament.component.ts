import { Tournament } from './../../../../../../_interfaces/tournament';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription, throwIfEmpty } from 'rxjs';
import { ElectronService } from '../../../../../../core/services';
import { Pairing } from '../../../../../../_interfaces/pairing';

import Swal from 'sweetalert2';

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
    can_unpair: false,
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
    let  retorno = await this.electronService.ipcRenderer.invoke("controller.rounds.generateRound", this.tournament_uuid);
    if(retorno.ok){
      this.new_round_emitter.emit(retorno.data.uuid);

      this.last_round_number = retorno.data.number;

      this.getPairings();

      Swal.fire({
        title: 'Sucesso!',
        text: 'Rodada gerada com sucesso!',
        icon: 'success',
        confirmButtonText: 'Fechar',
        toast: true,
        position: 'top-right',
        timer: 3000,
        timerProgressBar: true,
      });
    }else{
      Swal.fire({
          title: 'Erro!',
          text: retorno.message,
          icon: 'error',
          confirmButtonText: 'Fechar'
      });
    }
  }

  async unPairRound(){
    let  retorno = await this.electronService.ipcRenderer.invoke("controller.rounds.unPairRound", this.tournament_uuid, this.last_round_number);
    if(retorno.ok === 1){
      let retorno_round = await this.electronService.ipcRenderer.invoke("controller.rounds.getLastRound", this.tournament_uuid);
      if(retorno_round.ok === 1){
        this.new_round_emitter.emit(retorno_round.round.uuid);

        this.last_round_number = retorno_round.round.number;
        this.selected_round_number = this.last_round_number;

        this.getPairings();
      }else{
        this.new_round_emitter.emit(String(0));

        this.last_round_number = 0;
        this.selected_round_number = this.last_round_number;

        this.getPairings();
      }

      Swal.fire({
        title: 'Sucesso!',
        text: 'Rodada desemparceirada com sucesso!',
        icon: 'success',
        confirmButtonText: 'Fechar',
        toast: true,
        position: 'top-right',
        timer: 3000,
        timerProgressBar: true,
      });
    }else{
      Swal.fire({
          title: 'Erro!',
          text: retorno.message,
          icon: 'error',
          confirmButtonText: 'Fechar'
      });
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
          can_unpair: true,
          message: "Torneio apto para primeiro emparceiramento"
        }
      }else if(Number(this.tournament.rounds_number) === this.last_round_number){
        this.selected_round_status = {
          can_pairing: false,
          can_unpair: true,
          message: "Última rodada - Não é mais possível efetuar emparceiramentos."
        }
      }else{
        let  retorno = await this.electronService.ipcRenderer.invoke("controller.rounds.canGenerateNewRound", this.tournament_uuid);
        console.log(retorno);
        if(retorno.ok){
          if(retorno.result){
            this.selected_round_status = {
              can_pairing: true,
              can_unpair: true,
              message: "Apto para emparceiramento"
            }
          }else{
            this.selected_round_status = {
              can_pairing: false,
              can_unpair: true,
              message: retorno.message
            }
          }
        }else{
          this.selected_round_status = {
            can_pairing: false,
            can_unpair: true,
            message: "-"
          }
        }
      }
    }else{
      this.selected_round_status = {
        can_pairing: false,
        can_unpair: false,
        message: "A rodada não é a mais atual - Altere para a rodada mais atual para que seja possível emparceirar."
      }
    }
  }

  async getPairings(){
    this.row_selected = -1;
    console.log("Round Selected: ".concat(String(this.selected_round_number)));

    if(this.selected_round_number > 0){
      let retorno = await this.electronService.ipcRenderer.invoke("controller.rounds.getByNumber", this.tournament_uuid, this.selected_round_number);
      console.log(retorno)
      if(retorno.ok === 1){
        let round = retorno.round;
        let result_pairings = await this.electronService.ipcRenderer.invoke("controller.pairings.listByRound", round.uuid);
        console.log(result_pairings)
        if(result_pairings.ok === 1){
          this.pairings = result_pairings.pairings;

        }else{
          Swal.fire({
              title: 'Erro!',
              text: result_pairings.message,
              icon: 'error',
              confirmButtonText: 'Fechar'
          });
        }
      }else{
        Swal.fire({
            title: 'Erro!',
            text: retorno.message,
            icon: 'error',
            confirmButtonText: 'Fechar'
        });
      }
    }else{
      this.pairings = [];
    }
  }

  getPairingResult(pairing){
    if(pairing.have_result){
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
        return "".concat(String(pairing.player_a_result)).concat(" | ").concat(String(pairing.player_b_result));
      }
    }
    return "|";
  }



  row_selected = -1;

  selectRow(number){
    if(this.row_selected != number && number < this.pairings.length){
      this.row_selected = number;
    }
  }

  setEmptyResult(){
    if(this.row_selected >= 0 && this.row_selected < this.pairings.length){
      if(!this.pairings[this.row_selected].is_bye){
        this.pairings[this.row_selected].player_a_result = null;
        this.pairings[this.row_selected].player_b_result = null;
        this.pairings[this.row_selected].player_a_wo = null;
        this.pairings[this.row_selected].player_b_wo = null;
        this.pairings[this.row_selected].have_result = false;

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
        this.pairings[this.row_selected].have_result = true;

        this.updateResult(this.pairings[this.row_selected]);

        if(this.row_selected + 1 < this.pairings.length){
          this.row_selected++;
        }
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
        this.pairings[this.row_selected].have_result = true;

        this.updateResult(this.pairings[this.row_selected]);

        if(this.row_selected + 1 < this.pairings.length){
          this.row_selected++;
        }
      }
    }
  }

  async updateResult(pairing){
    let return_update_result = await this.electronService.ipcRenderer.invoke("controller.pairings.update", pairing);
    if(return_update_result.ok === 1){
      this.statusSelectedRound();
      return {ok:1,error:0}
    }else{
      Swal.fire({
          title: 'Erro!',
          text: return_update_result.message,
          icon: 'error',
          confirmButtonText: 'Fechar'
      });
    }
    return return_update_result;
  }


  getPoints(player,round_number){
    if(player){
      for(let standing of player.standings){
        if(standing){
          if(standing.round_number === (round_number-1)){
            return standing.points;
          }
        }
      }
      return 0;
    }
    return -1;
  }
}
