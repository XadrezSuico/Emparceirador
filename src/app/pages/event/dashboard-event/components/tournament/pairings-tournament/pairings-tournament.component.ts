import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ElectronService } from '../../../../../../core/services';

@Component({
  selector: 'app-pairings-tournament',
  templateUrl: './pairings-tournament.component.html',
  styleUrls: ['./pairings-tournament.component.scss']
})
export class PairingsTournamentComponent implements OnInit {

  @Input()
  tournament_uuid;

  constructor(
    private electronService: ElectronService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
  }

  async generateRound(){
    let  retorno = await this.electronService.ipcRenderer.invoke("model.rounds.generateRound", this.tournament_uuid);
    if(retorno.ok){
      alert(1);
    }

  }
}
