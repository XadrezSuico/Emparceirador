import { Tournament } from './../../../../../../_interfaces/tournament';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription, throwIfEmpty } from 'rxjs';
import { ElectronService } from '../../../../../../core/services';

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

  ngOnInit() {
    this.statusSelectedRound();
  }


  ngOnDestroy() {

  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("changed");
    console.log(changes);
    this.statusSelectedRound();
  }

  async generateRound(){
    let  retorno = await this.electronService.ipcRenderer.invoke("model.rounds.generateRound", this.tournament_uuid);
    if(retorno.ok){
      this.new_round_emitter.emit(retorno.data.uuid);

      this.last_round_number = retorno.data.number;
    }
  }

  newRoundEvent(round_number:number){
    this.last_round_number = Number(round_number);
    this.ref.markForCheck();
  }

  roundChangedEvent(round_number:number){
    this.selected_round_number = Number(round_number);
    this.ref.markForCheck();
  }

  async canGenerateNewRound(){
      return this.selected_round_status.can_pairing;
  }

  async statusSelectedRound(){
    if(Number(this.selected_round_number) === Number(this.last_round_number)){
      if(Number(this.tournament.rounds_number) === this.last_round_number){
        this.selected_round_status = {
          can_pairing: false,
          message: "Última rodada."
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
}
