import { XadrezSuicoFile } from './../../../_interfaces/_file/xs-file';
import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../core/services';

@Component({
  selector: 'app-list-events',
  templateUrl: './list-events.component.html',
  styleUrls: ['./list-events.component.scss']
})
export class ListEventsComponent implements OnInit {

  events:Array<XadrezSuicoFile>
  constructor(
    private electronService: ElectronService
  ) { }

  ngOnInit() {
    this.electronService.ipcRenderer.send("set-title", "Listar Eventos");
    this.getEvents();
  }

  async getEvents(){
    let retorno = await this.electronService.ipcRenderer.invoke("controller.events.listAll");
    if(retorno.ok == 1){
      this.events = retorno.events;
    }
    console.log(retorno);
  }

}
