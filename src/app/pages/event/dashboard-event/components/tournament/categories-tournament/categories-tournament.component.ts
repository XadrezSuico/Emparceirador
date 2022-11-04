import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ElectronService } from '../../../../../../core/services';
import { Category } from '../../../../../../_interfaces/category';

@Component({
  selector: 'app-categories-tournament',
  templateUrl: './categories-tournament.component.html',
  styleUrls: ['./categories-tournament.component.scss']
})
export class CategoriesTournamentComponent implements OnInit {

  @Input()
  tournament_uuid;

  categories:Array<Category> = [];

  category:Category = {
    uuid:'',
    name:''
  };

  constructor(
    private electronService: ElectronService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    if(this.tournament_uuid){
      this.list();
    }
  }
  async list(){
    let  retorno = await this.electronService.ipcRenderer.invoke("controller.categories.listFromTournament", this.tournament_uuid);
    if(retorno.ok){
      this.categories = retorno.categories;
    }
  }


  async get(content,uuid){
    let  retorno = await this.electronService.ipcRenderer.invoke("controller.categories.get", uuid);
    if(retorno.ok){
      this.category = retorno.category;

      this.open(content);
    }
  }

  new_category(content){
    this.category = {
      uuid:'',
      name:''
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
    if(this.category.uuid){
      retorno = await this.electronService.ipcRenderer.invoke("controller.categories.update", this.category);
    }else{
      retorno = await this.electronService.ipcRenderer.invoke("controller.categories.create", this.tournament_uuid, this.category);
    }
    if(retorno.ok){
      this.list();
      this.modalService.dismissAll();
    }
  }


  async remove(uuid){
    let retorno = await this.electronService.ipcRenderer.invoke("controller.categories.remove", uuid);
    if(retorno.ok){
      this.list();
    }
  }

}
