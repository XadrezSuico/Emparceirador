import { Component, Input, OnInit } from '@angular/core';
import { ElectronService } from '../../../../../../core/services';
import { Player } from '../../../../../../_interfaces/player';

@Component({
  selector: 'app-players-tournament',
  templateUrl: './players-tournament.component.html',
  styleUrls: ['./players-tournament.component.scss']
})
export class PlayersTournamentComponent implements OnInit {

  @Input()
  tournament_uuid;

  players:Array<Player> = [];
  constructor(
    private electronService: ElectronService
  ) { }

  ngOnInit() {
    if(this.tournament_uuid){
      this.list();
    }
  }
  async list(){
    let  retorno = await this.electronService.ipcRenderer.invoke("model.players.listByTournament", this.tournament_uuid);
    if(retorno.ok){
      this.players = retorno.players;
    }
  }

}
