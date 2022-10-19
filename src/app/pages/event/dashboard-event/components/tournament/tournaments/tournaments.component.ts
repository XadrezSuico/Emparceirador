import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { ElectronService } from '../../../../../../core/services';
import { Tournament } from '../../../../../../_interfaces/tournament';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.scss']
})
export class TournamentsComponent implements OnInit, AfterViewInit {

  @Input()
  event_uuid;

  tournaments:Array<Tournament>;
  tournament:Tournament;
  constructor(
    private electronService: ElectronService
  ) { }

  ngAfterViewInit(): void {
    this.getTournaments();
  }

  ngOnInit() {
  }

  async getTournaments(){
    let retorno = await this.electronService.ipcRenderer.invoke("model.tournaments.listFromEvent",this.event_uuid);
    if(retorno.ok == 1){
      this.tournaments = retorno.tournaments;
    }
    console.log(retorno);
  }

  async onNewTournament(event:string){
    let retorno = await this.electronService.ipcRenderer.invoke("model.tournaments.get",event);
    if(retorno.ok == 1){
      this.tournaments[this.tournaments.length] = retorno.tournament;
    }else{
      alert("error");
    }
    console.log(retorno);
  }

}
