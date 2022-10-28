import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faFolderOpen, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { ElectronService } from '../core/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  faAdd = faPlusCircle;
  faOpen = faFolderOpen;

  constructor(
    private router: Router,
    private electronService: ElectronService
  ) {
    if(this.electronService) if(this.electronService.ipcRenderer) this.electronService.ipcRenderer.send("set-title", "");
  }

  ngOnInit(): void {
  }

}
