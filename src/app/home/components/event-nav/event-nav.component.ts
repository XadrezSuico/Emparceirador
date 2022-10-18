import { Component, OnInit } from '@angular/core';
import { faFolderOpen, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-event-nav',
  templateUrl: './event-nav.component.html',
  styleUrls: ['./event-nav.component.scss']
})
export class EventNavComponent implements OnInit {

  faAdd = faPlusCircle;
  faOpen = faFolderOpen;
  constructor() { }

  ngOnInit() {
  }

}
