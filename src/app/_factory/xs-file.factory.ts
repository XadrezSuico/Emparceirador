import { XadrezSuicoFile } from './../_interfaces/_file/xs-file';
import { Injectable } from "@angular/core";
import { TimeControl } from '../_interfaces/_enums/_time-control';

@Injectable({
  providedIn: 'root'
})
export class XadrezSuicoFileFactory{
  create():XadrezSuicoFile{
    return {
      uuid:"",
      name:"",
      date_start:"",
      date_finish:"",
      time_control:TimeControl.RPD,
      place:"",

      tournaments:[]
    }
  }
}
