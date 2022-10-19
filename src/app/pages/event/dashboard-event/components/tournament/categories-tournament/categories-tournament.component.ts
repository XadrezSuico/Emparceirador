import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
    let  retorno = await this.electronService.ipcRenderer.invoke("model.categories.listFromTournament", this.tournament_uuid);
    if(retorno.ok){
      this.categories = retorno.categories;
    }
  }


	open(content) {
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
			},
			(reason) => {
			},
		);
	}

  save(){

  }

}
