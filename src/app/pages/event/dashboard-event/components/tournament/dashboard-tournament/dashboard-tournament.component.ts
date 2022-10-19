import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ElectronService } from '../../../../../../core/services';
import { Tournament } from '../../../../../../_interfaces/tournament';
import { TournamentType } from '../../../../../../_interfaces/_enums/_tournament_type';

@Component({
  selector: 'app-dashboard-tournament',
  templateUrl: './dashboard-tournament.component.html',
  styleUrls: ['./dashboard-tournament.component.scss']
})
export class DashboardTournamentComponent implements OnInit {

  @Input()
  event_uuid;

  @Input()
  tournament_uuid;

  @Output()
  new_tournament_event_emitter = new EventEmitter<string>();

  tournament:Tournament = {
    uuid:'',
    name:'',
    tournament_type: TournamentType.SWISS
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

}
