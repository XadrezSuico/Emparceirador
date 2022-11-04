import { XadrezSuicoFile } from './../../../_interfaces/_file/xs-file';
import { XadrezSuicoFileFactory } from './../../../_factory/xs-file.factory';
import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../core/services';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

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

    this.electronService.ipcRenderer.on("controllers.events.created",(_event,value) => {
      console.log(value);
      if(value.ok === 1){
        console.log("/event/".concat(value.data.uuid).concat("/dashboard"));
        setTimeout(()=>{
          this.router.navigate(["/?elec_route=event/".concat(value.data.uuid).concat("/dashboard")]);
        },500);
      }
    });


    this.electronService.ipcRenderer.on("controllers.events.selectedFile",(_event,value) => {
      this.xadrezsuico.file_path = value;
    });
  }

  ngOnInit() {
  }

  async save(){
    if(this.xadrezsuico.file_path){
      let retorno = await this.electronService.ipcRenderer.invoke("controller.events.create", this.xadrezsuico);
      console.log(retorno);

      if(retorno.ok == 1){
        Swal.fire({
          title: 'Sucesso!',
          text: 'Evento criado com sucesso!',
          icon: 'success',
          confirmButtonText: 'Fechar',
          toast: true,
          position: 'top-right',
          timer: 3000,
          timerProgressBar: true,
        });
        this.router.navigate(["/event/".concat(retorno.data.uuid).concat("/dashboard")]);
      }
    }else{
      Swal.fire({
        title: 'Erro!',
        text: "Para salvar o evento é necessário escolher o local para salvar o arquivo.",
        icon: 'error',
        confirmButtonText: 'Fechar'
      });
    }
  }


  async openSaveDialog(){
    await this.electronService.ipcRenderer.invoke("controller.import-export.save_file_dialog","controllers.events.selectedFile");
  }

}
