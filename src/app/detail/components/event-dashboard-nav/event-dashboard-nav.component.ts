import { Component, OnInit } from '@angular/core';
import { faFolderOpen, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-event-dashboard-nav',
  templateUrl: './event-dashboard-nav.component.html',
  styleUrls: ['./event-dashboard-nav.component.scss']
})
export class EventDashboardNavComponent implements OnInit {

  faAdd = faPlusCircle;
  faOpen = faFolderOpen;
  constructor() { }

  ngOnInit() {
  }

}
