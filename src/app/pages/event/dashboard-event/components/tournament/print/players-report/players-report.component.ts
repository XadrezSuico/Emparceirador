import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {jsPDF} from 'jspdf';

@Component({
  selector: 'app-players-report',
  templateUrl: './players-report.component.html',
  styleUrls: ['./players-report.component.scss']
})
export class PlayersReportComponent implements OnInit {

  @Input()
  tournament;

  @Input()
  players = [];



  @ViewChild('printDiv', {static: false}) printDiv: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  public downloadAsPDF() {
    const doc = new jsPDF();

    const specialElementHandlers = {
      '#editor': function (element, renderer) {
        return true;
      }
    };

    const printHtml = this.printDiv.nativeElement;

    // doc.fromHTML(printHtml.innerHTML, 15, 15, {
    //   width: 190,
    //   'elementHandlers': specialElementHandlers
    // });

    // doc.save('players.pdf');



    doc.html(printHtml.innerHTML,{
      callback: () => {
        doc.save('players.pdf');
      }
    });
  }

}
