import { XadrezSuicoFile } from './../../../_interfaces/_file/xs-file';
import { XadrezSuicoFileFactory } from './../../../_factory/xs-file.factory';
import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../core/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-event',
  templateUrl: './new-event.component.html',
  styleUrls: ['./new-event.component.scss']
})
export class NewEventComponent implements OnInit {


  xadrezsuico:XadrezSuicoFile;

  time_controls = [
    {
      label:"Blitz/Relâmpago",
      value:"BTZ"
    },
    {
      label:"Rápido",
      value:"RPD"
    },
    {
      label:"Convencional",
      value:"STD"
    },
  ]

  constructor(
    private xs_file_factory:XadrezSuicoFileFactory,
    private electronService: ElectronService,
    private router: Router
  ) {
    this.xadrezsuico = xs_file_factory.create();

    this.electronService.ipcRenderer.send("set-title", "Novo Evento");
  }

  ngOnInit() {
  }

  async save(){
    let retorno = await this.electronService.ipcRenderer.invoke("model.events.create", this.xadrezsuico);
    console.log(retorno);

    if(retorno.ok == 1){
        this.router.navigate(["/event/".concat(retorno.data.uuid).concat("/dashboard")]);
    }
  }

}
