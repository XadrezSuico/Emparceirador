import { Ordering } from './../../../../../../_interfaces/_enums/_ordering';
import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ElectronService } from '../../../../../../core/services';
import { Category } from '../../../../../../_interfaces/category';
import { Player } from '../../../../../../_interfaces/player';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-players-tournament',
  templateUrl: './players-tournament.component.html',
  styleUrls: ['./players-tournament.component.scss']
})
export class PlayersTournamentComponent implements OnInit {

  @Input()
  tournament_uuid;
  @Input()
  tournament;


  @Input()
  last_round_number;
  @Input()
  selected_round_number;

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


  player_from:Player = {
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
    let  retorno = await this.electronService.ipcRenderer.invoke("controller.players.listByTournament", this.tournament_uuid, [Ordering.START_NUMBER, Ordering.ALPHABETICAL]);
    if(retorno.ok){
      this.players = retorno.players;
    }
  }
  async categories_list(){
    let  retorno = await this.electronService.ipcRenderer.invoke("controller.categories.listFromTournament", this.tournament_uuid);
    if(retorno.ok){
      this.categories = retorno.categories;

      console.log(this.categories);
    }
  }


  async get(content,uuid){
    let  retorno = await this.electronService.ipcRenderer.invoke("controller.players.get", uuid);
    if(retorno.ok){
      this.player = retorno.player;
      this.player = JSON.parse(JSON.stringify(retorno.player));

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
      retorno = await this.electronService.ipcRenderer.invoke("controller.players.update", this.player);

      Swal.fire({
        title: 'Sucesso!',
        text: 'Jogador editado com sucesso!',
        icon: 'success',
        confirmButtonText: 'Fechar',
        toast: true,
        position: 'top-right',
        timer: 3000,
        timerProgressBar: true,
      });

      if(retorno.ok === 1){
        if(this.player.category_uuid !== this.player_from.category_uuid){
          this.updateStandings();
        }
      }
    }else{
      retorno = await this.electronService.ipcRenderer.invoke("controller.players.create", this.tournament_uuid, this.player);


      Swal.fire({
        title: 'Sucesso!',
        text: 'Jogador inserido com sucesso!',
        icon: 'success',
        confirmButtonText: 'Fechar',
        toast: true,
        position: 'top-right',
        timer: 3000,
        timerProgressBar: true,
      });
    }
    if(retorno.ok){
      this.list();
      this.modalService.dismissAll();
    }
  }


  async updateStandings(){
    let first_round_request = await this.electronService.ipcRenderer.invoke("controller.rounds.getByNumber",this.tournament.uuid,1);
    if(first_round_request.ok === 1){
      let retorno = await this.electronService.ipcRenderer.invoke("controller.rounds.updateStandings",first_round_request.round.uuid);
      if(retorno.ok == 1){
        console.log("Standings updated");
      }
    }
  }

  showRemoveModal(player){
    Swal.fire({
      title: 'Confirmação',
      html: "Deseja realmente remover o jogador '".concat(player.name).concat(" (No. ").concat(player.start_number).concat(")'?"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    })
    .then((result) => {
      if (result.isConfirmed) {
        this.remove(player.uuid);
      }
    })
  }
  async remove(uuid){
    let retorno = await this.electronService.ipcRenderer.invoke("controller.players.remove", uuid);
    if(retorno.ok === 1){
      Swal.fire({
        title: 'Sucesso!',
        text: 'Jogador removido com sucesso!',
        icon: 'success',
        confirmButtonText: 'Fechar',
        toast: true,
        position: 'top-right',
        timer: 3000,
        timerProgressBar: true,
      });
      this.list();
    }else{
      Swal.fire({
        title: 'Erro!',
        text: retorno.message,
        icon: 'error',
        confirmButtonText: 'Fechar'
      });
    }
  }


  async reorderPlayers(){
    let retorno = await this.electronService.ipcRenderer.invoke("controller.players.reorderPlayers", this.tournament_uuid);
    if(retorno.ok){
      this.list();


      Swal.fire({
        title: 'Sucesso!',
        text: 'Jogadores reordenados com sucesso!',
        icon: 'success',
        confirmButtonText: 'Fechar',
        toast: true,
        position: 'top-right',
        timer: 3000,
        timerProgressBar: true,
      });
    }
  }

}
