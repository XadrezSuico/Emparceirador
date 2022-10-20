import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ElectronService } from '../../../../../../core/services';
import { Category } from '../../../../../../_interfaces/category';
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

  player:Player = {
    uuid:'',
    start_number:0,
    name:'',
    city: {
      uuid: '',
      name:''
    },
    club: {
      uuid: '',
      name:''
    },
    category_uuid: ''
  };



  categories:Array<Category> = [];

  constructor(
    private electronService: ElectronService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    if(this.tournament_uuid){
      this.list();

      this.categories_list();
    }
  }
  async list(){
    let  retorno = await this.electronService.ipcRenderer.invoke("model.players.listByTournament", this.tournament_uuid);
    if(retorno.ok){
      this.players = retorno.players;
    }
  }
  async categories_list(){
    let  retorno = await this.electronService.ipcRenderer.invoke("model.categories.listFromTournament", this.tournament_uuid);
    if(retorno.ok){
      this.categories = retorno.categories;

      console.log(this.categories);
    }
  }


  async get(content,uuid){
    let  retorno = await this.electronService.ipcRenderer.invoke("model.players.get", uuid);
    if(retorno.ok){
      this.player = retorno.player;

      this.open(content);
    }
  }

  new_player(content){
    this.player = {
      uuid:'',
      start_number:0,
      name:'',
      city: {
        uuid: '',
        name:''
      },
      club: {
        uuid: '',
        name:''
      },
      category_uuid: ''
    };

    this.open(content);
  }

	open(content) {
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
			},
			(reason) => {
			},
		);
	}

  async save(){
    let retorno;
    if(this.player.uuid){
      retorno = await this.electronService.ipcRenderer.invoke("model.players.update", this.player);
    }else{
      retorno = await this.electronService.ipcRenderer.invoke("model.players.create", this.tournament_uuid, this.player);
    }
    if(retorno.ok){
      this.list();
      this.modalService.dismissAll();
    }
  }

  async remove(uuid){
    let retorno = await this.electronService.ipcRenderer.invoke("model.players.remove", uuid);
    if(retorno.ok){
      this.list();
    }
  }

}
