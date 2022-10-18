import { Pair } from "./pair";

export interface Round{
  uuid:string;
  id?:number;
  number:number; // round's number

  pairings:Array<Pair>;
}
