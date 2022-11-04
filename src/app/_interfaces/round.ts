import { Tournament } from './tournament';
import { Pairing } from "./pairing";

export interface Round{
  uuid:string;
  id?:number;
  number:number; // round's number

  pairings:Array<Pairing>;

  tournament?:Tournament;
}
