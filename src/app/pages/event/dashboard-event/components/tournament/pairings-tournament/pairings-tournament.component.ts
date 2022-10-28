import { Tournament } from './../../../../../../_interfaces/tournament';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription, throwIfEmpty } from 'rxjs';
import { ElectronService } from '../../../../../../core/services';
import { Pairing } from '../../../../../../_interfaces/pairing';

import Swal from 'sweetalert2';
import { TournamentType } from '../../../../../../_interfaces/_enums/_tournament_type';

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

  @Output()
  result_change_emitter = new EventEmitter<void>();

  @Output()
  is_requesting_emmiter = new EventEmitter<boolean>();

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
    this.is_requesting_emmiter.emit(true);
    let  retorno = await this.electronService.ipcRenderer.invoke("controller.rounds.generateRound", this.tournament_uuid);
    console.log("generateRound")
    console.log(retorno)
    if(retorno.ok){
      this.new_round_emitter.emit(retorno.data.uuid);

      this.last_round_number = retorno.data.number;

      await this.getPairings();

      if(this.tournament.tournament_type === TournamentType.SWISS){
        Swal.fire({
          title: 'Sucesso!',
          text: 'Rodada emparceirada com sucesso!',
          icon: 'success',
          confirmButtonText: 'Fechar',
          toast: true,
          position: 'top-right',
          timer: 3000,
          timerProgressBar: true,
        });
      }else{
        Swal.fire({
          title: 'Sucesso!',
          text: 'Torneio emparceirado com sucesso!',
          icon: 'success',
          confirmButtonText: 'Fechar',
          toast: true,
          position: 'top-right',
          timer: 3000,
          timerProgressBar: true,
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

    this.is_requesting_emmiter.emit(false);
  }

  showUnpairRoundModal(){
    if(this.tournament.tournament_type === TournamentType.SWISS){
      Swal.fire({
        title: 'Confirmação',
        html: "Deseja realmente desemparceirar esta rodada?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.unPairRound();
        }
      })
    }else{
      Swal.fire({
        title: 'Confirmação',
        html: "Como se trata de um torneio no sistema Schüring/Round-robin/Todos-contra-todos é apenas possível desemparceirar todas as rodadas. Deseja realmente fazer isso?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.unPairRound();
        }
      })
    }
  }

  async unPairRound(){
    this.is_requesting_emmiter.emit(true);
    let  retorno = await this.electronService.ipcRenderer.invoke("controller.rounds.unPairRound", this.tournament_uuid, this.last_round_number);
    if(retorno.ok === 1){
      let retorno_round = await this.electronService.ipcRenderer.invoke("controller.rounds.getLastRound", this.tournament_uuid);
      if(retorno_round.ok === 1){
        this.new_round_emitter.emit(retorno_round.round.uuid);

        this.last_round_number = retorno_round.round.number;
        this.selected_round_number = this.last_round_number;

        await this.getPairings();
      }else{
        this.new_round_emitter.emit(String(0));

        this.last_round_number = 0;
        this.selected_round_number = this.last_round_number;

        await this.getPairings();
      }

      if(this.tournament.tournament_type === TournamentType.SWISS){
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
          title: 'Sucesso!',
          text: 'Torneio desemparceirado com sucesso!',
          icon: 'success',
          confirmButtonText: 'Fechar',
          toast: true,
          position: 'top-right',
          timer: 3000,
          timerProgressBar: true,
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
    this.is_requesting_emmiter.emit(false);
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
    if(this.tournament.tournament_type === TournamentType.SWISS){
      if(Number(this.selected_round_number) === Number(this.last_round_number)){
        if(Number(this.last_round_number) === 0){
          this.selected_round_status = {
            can_pairing: true,
            can_unpair: false,
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
    }else{
      if(Number(this.last_round_number) === 0){
        this.selected_round_status = {
          can_pairing: true,
          can_unpair: false,
          message: "Torneio apto para emparceiramento"
        }
      }else{
        this.selected_round_status = {
          can_pairing: false,
          can_unpair: true,
          message: "Torneio em andamento"
        }
      }
    }
  }

  async getPairings(){
    this.row_selected = -1;
    this.pairings = [];
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
      if(pairing.is_bye){
        return "".concat(String(pairing.player_a_result)).concat("");
      }
      if(pairing.player_a_result || pairing.player_b_result){
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

  async setEmptyResult(){
    if(this.row_selected >= 0 && this.row_selected < this.pairings.length){
      if(!this.pairings[this.row_selected].is_bye){
        this.pairings[this.row_selected].player_a_result = null;
        this.pairings[this.row_selected].player_b_result = null;
        this.pairings[this.row_selected].player_a_wo = null;
        this.pairings[this.row_selected].player_b_wo = null;
        this.pairings[this.row_selected].have_result = false;

        await this.updateResult(this.pairings[this.row_selected]);
      }
    }
  }

  async setResult(player_a,player_b){
    if(this.row_selected >= 0 && this.row_selected < this.pairings.length){
      if(!this.pairings[this.row_selected].is_bye){
        this.pairings[this.row_selected].player_a_result = player_a;
        this.pairings[this.row_selected].player_b_result = player_b;
        this.pairings[this.row_selected].player_a_wo = false;
        this.pairings[this.row_selected].player_b_wo = false;
        this.pairings[this.row_selected].have_result = true;

        if(this.row_selected + 1 < this.pairings.length){
          await this.updateResult(this.pairings[this.row_selected++]);
        }else{
          await this.updateResult(this.pairings[this.row_selected]);
        }
      }
    }
  }
  async setResultWO(player_a,player_b){
    if(this.row_selected >= 0 && this.row_selected < this.pairings.length){
      if(!this.pairings[this.row_selected].is_bye){
        this.pairings[this.row_selected].player_a_result = player_a;
        this.pairings[this.row_selected].player_b_result = player_b;
        this.pairings[this.row_selected].player_a_wo = (player_a) ? false : true;
        this.pairings[this.row_selected].player_b_wo = (player_b) ? false : true;
        this.pairings[this.row_selected].have_result = true;

        if(this.row_selected + 1 < this.pairings.length){
          await this.updateResult(this.pairings[this.row_selected++]);
        }else{
          await this.updateResult(this.pairings[this.row_selected]);
        }

      }
    }
  }

  async updateResult(pairing){
    let return_update_result = await this.electronService.ipcRenderer.invoke("controller.pairings.update", pairing, true);
    if(return_update_result.ok === 1){
      this.statusSelectedRound();
      this.result_change_emitter.emit();

      if(this.selected_round_number < this.last_round_number){
        let return_update_standing = await this.electronService.ipcRenderer.invoke("controller.rounds.updateStandingsFromTournament", this.tournament.uuid, this.selected_round_number);
        if(return_update_standing.ok === 1){
          return {ok:1,error:0};
        }
      }else{
        return {ok:1,error:0};
      }
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

  pointsButtonsEnabled(){
    if(this.row_selected >= 0){
      if(!this.pairings[this.row_selected].is_bye){
        return true;
      }
    }
    return false;
  }
}
