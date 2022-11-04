import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { faFolderOpen, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { ElectronService } from '../../../core/services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-event-nav',
  templateUrl: './event-nav.component.html',
  styleUrls: ['./event-nav.component.scss']
})
export class EventNavComponent implements OnInit {

  faAdd = faPlusCircle;
  faOpen = faFolderOpen;

  @Output()
  event_imported_emitter = new EventEmitter<void>();

  constructor(
    private electronService: ElectronService,
    private router: Router,
    private zone: NgZone
    ) {

    this.electronService.ipcRenderer.on("controllers.events.imported",(_event,value) => {
      console.log(value);

      this.zone.run(() => {
        this.event_imported_emitter.emit();
      });

      Swal.fire({
        title: 'Confirmação',
        html: "Evento importado. Deseja abrir o evento?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.zone.run(() => {
            this.router.navigate(["/event/".concat(value.uuid).concat("/dashboard")]);
          });
        }
      })
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
          this.zone.run(() => {
            this.import(value.confirmed,"import_event",value.file_path);
          });
        }
      })
    });
    }

  ngOnInit() {
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

}
