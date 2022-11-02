import { XadrezSuicoFile } from './../../../_interfaces/_file/xs-file';
import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../core/services';

import Swal from "sweetalert2";

@Component({
  selector: 'app-list-events',
  templateUrl: './list-events.component.html',
  styleUrls: ['./list-events.component.scss']
})
export class ListEventsComponent implements OnInit {

  events:Array<XadrezSuicoFile>
  constructor(
    private electronService: ElectronService
  ) {

    this.electronService.ipcRenderer.on("controllers.events.imported",(_event,value) => {
      console.log(value);
      if(value.ok === 1){
        alert(1);
      }
    });
    this.electronService.ipcRenderer.on("controllers.events.import.confirm",(_event,value) => {
      let html = value.message;
      Swal.fire({
        title: 'Confirmação',
        html: html,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.import(value.confirmed,"import_event",value.file_path);
        }
      })
    });
  }

  ngOnInit() {
    this.electronService.ipcRenderer.send("set-title", "Listar Eventos");
    this.getEvents();
  }

  async import(data = null,event_name = null,file_path = null){
    if(event_name){
      if(file_path){
        await this.electronService.ipcRenderer.invoke("controller.import-export.".concat(event_name),file_path,data);
      }else{
        await this.electronService.ipcRenderer.invoke("controller.import-export.".concat(event_name),null,data);
      }
    }else{
      await this.electronService.ipcRenderer.invoke("controller.import-export.open_import_dialog",data);
    }
  }

  async getEvents(){
    let retorno = await this.electronService.ipcRenderer.invoke("controller.events.listAll");
    if(retorno.ok == 1){
      this.events = retorno.events;
    }
    console.log(retorno);
  }

  async openDeleteDialog(event){
    let html = "Deseja <strong>realmente</strong> excluir este evento?";
    if(event.file_path){
      html = html.concat("<hr/>O arquivo de exportação em '").concat(event.file_path).concat("' continuará salvo e será apenas removido do software e você poderá importá-lo posteriormente novamente.");
    }else{
      html = html.concat("<hr/>Como este evento <strong>não possui arquivo de exportação</strong> ele será excluído definitivamente e não será possível recuperá-lo.");
    }
    html = html.concat("<hr/>Deseja remover o evento?");
    Swal.fire({
      title: 'Confirmação',
      html: html,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    })
    .then((result) => {
      if (result.isConfirmed) {
        this.delete(event.uuid);
      }
    })
  }

  async delete(uuid){
    let retorno = await this.electronService.ipcRenderer.invoke("controller.events.delete",uuid);
    if(retorno.ok == 1){
        Swal.fire({
          title: 'Sucesso!',
          text: 'Evento removido com sucesso!',
          icon: 'success',
          confirmButtonText: 'Fechar',
          toast: true,
          position: 'top-right',
          timer: 3000,
          timerProgressBar: true,
        });
      this.getEvents();
    }else{
      Swal.fire({
        title: 'Erro!',
        text: retorno.message,
        icon: 'error',
        confirmButtonText: 'Fechar'
      });
    }
    console.log(retorno);
  }

}
