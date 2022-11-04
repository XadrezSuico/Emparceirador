import { Category } from "../category";
import { Tournament } from "../tournament";
import { TimeControl } from "../_enums/_time-control";

export interface XadrezSuicoFile{
  id?:number;
  uuid:string;
  name:string;
  date_start:string;
  date_finish:string;
  time_control:TimeControl;
  place:string;
  file_path:string;

  tournaments:Array<Tournament>;
}
