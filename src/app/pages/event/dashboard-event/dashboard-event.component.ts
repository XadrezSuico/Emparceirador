import { Tournament } from './../../../_interfaces/tournament';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '../../../core/services';

@Component({
  selector: 'app-dashboard-event',
  templateUrl: './dashboard-event.component.html',
  styleUrls: ['./dashboard-event.component.scss']
})
export class DashboardEventComponent implements OnInit, AfterViewInit {

  event_uuid;
  event;

  tournaments:Array<Tournament> = [];
  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.event_uuid = this.route.snapshot.paramMap.get('uuid');
  }
  ngAfterViewInit(): void {
    this.getEvent();
  }

  async getEvent(){
    let retorno = await this.electronService.ipcRenderer.invoke("model.events.get",this.event_uuid);
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

}
