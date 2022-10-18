import { Component, Input, OnInit } from '@angular/core';
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

  tournament:Tournament = {
    uuid:'',
    name:'',
    tournament_type: TournamentType.SWISS
  };
  constructor(
    private electronService: ElectronService
  ) { }

  ngOnInit() {
  }



  async save(){
    let retorno;
    if(this.tournament_uuid){
      retorno = await this.electronService.ipcRenderer.invoke("model.tournaments.update", this.event_uuid, this.tournament_uuid, this.tournament);
    }else{
      retorno = await this.electronService.ipcRenderer.invoke("model.tournaments.create", this.event_uuid, this.tournament);
    }
    console.log(retorno);
  }

}
