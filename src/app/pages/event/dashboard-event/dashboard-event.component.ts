import { Tournament } from './../../../_interfaces/tournament';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '../../../core/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard-event',
  templateUrl: './dashboard-event.component.html',
  styleUrls: ['./dashboard-event.component.scss']
})
export class DashboardEventComponent implements OnInit, AfterViewInit {

  faSyncAlt = faSyncAlt;

  is_requesting:boolean = false;

  event_uuid;
  event;
  edit_event;

  tournaments:Array<Tournament> = [];
  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {
  }

  ngOnInit() {
    this.event_uuid = this.route.snapshot.paramMap.get('uuid');
  }
  ngAfterViewInit(): void {
    this.getEvent();
  }
  requestingChange(is_requesting:boolean){
    this.is_requesting = is_requesting;
  }

  async getEvent(){
    let retorno = await this.electronService.ipcRenderer.invoke("controller.events.get",this.event_uuid);
    if(retorno.ok == 1){
      this.event = retorno.event;

      this.electronService.ipcRenderer.send("set-title", "Administrar Evento: ".concat(retorno.event.name));
    }
    console.log(retorno);
  }

  getTimeControl(){
    if(this.event){
      switch(this.event.time_control){
        case "STD":
          return "Convencional";
        case "RPD":
          return "Rápido";
        case "BTZ":
          return "Blitz/Relâmpago"
      }
    }
  }

  edit(content){
    this.edit_event = JSON.parse(JSON.stringify(this.event));
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
    let retorno = await this.electronService.ipcRenderer.invoke("controller.events.update", this.edit_event);
    if(retorno.ok){
      this.getEvent();
      this.modalService.dismissAll();
    }
  }

}
