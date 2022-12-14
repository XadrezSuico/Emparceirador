import { Component, Input, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { faChess, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { ElectronService } from '../../../../../../core/services';
import { Tournament } from '../../../../../../_interfaces/tournament';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.scss']
})
export class TournamentsComponent implements OnInit, AfterViewInit {
  tournament_icon = faChess;
  new_icon = faPlusCircle;

  @Input()
  event_uuid;

  @Output()
  is_requesting_emmiter = new EventEmitter<boolean>();

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

  async requestingChange(is_requesting:boolean){
    this.is_requesting_emmiter.emit(is_requesting);
  }

  async getTournaments(){
    let retorno = await this.electronService.ipcRenderer.invoke("controller.tournaments.listFromEvent",this.event_uuid);
    if(retorno.ok == 1){
      this.tournaments = retorno.tournaments;
    }
    console.log(retorno);
  }

  async onNewTournament(event:string){
    let retorno = await this.electronService.ipcRenderer.invoke("controller.tournaments.get",event);
    if(retorno.ok == 1){
      this.tournaments[this.tournaments.length] = retorno.tournament;
    }else{
      alert("error");
    }
    console.log(retorno);
  }

}
