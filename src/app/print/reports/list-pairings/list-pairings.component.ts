import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '../../../core/services';

@Component({
  selector: 'app-list-pairings',
  templateUrl: './list-pairings.component.html',
  styleUrls: ['./list-pairings.component.scss']
})
export class ListPairingsComponent implements OnInit {

  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute,
  ) {
    this.tournament_uuid = this.route.snapshot.paramMap.get('tournament_uuid');
    this.round_uuid = this.route.snapshot.paramMap.get('round_uuid');
    this.get();
  }

  tournament_uuid;
  round_uuid;
  tournament;
  round;
  pairings = [];

  ngOnInit() {
  }


  async get(){
    let tournament_request = await this.electronService.ipcRenderer.invoke("controller.tournaments.get",this.tournament_uuid);
    if(tournament_request.ok === 1){
      this.tournament = tournament_request.tournament;
      let round_request = await this.electronService.ipcRenderer.invoke("controller.rounds.get",this.round_uuid);
      if(round_request.ok === 1){
        this.round = round_request.round;

        let result_pairings = await this.electronService.ipcRenderer.invoke("controller.pairings.listByRound", this.round.uuid);
        console.log(result_pairings)
        if(result_pairings.ok === 1){
          this.pairings = result_pairings.pairings;
        }
      }
    }
  }


  getPoints(player){
    if(player){
      for(let standing of player.standings){
        if(standing){
          if(standing.round_number === (this.round.number-1)){
            return standing.points;
          }
        }
      }
      return 0;
    }
    return -1;
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

}
