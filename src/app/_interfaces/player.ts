import { Category } from './category';
import { City } from './city';
import { Club } from './club';

export interface Player{
  uuid:string;
  id?:number;
  name:string;
  start_number:number;

  firstname?:string;
  lastname?:string;

  borndate?:Date;

  city:City;
  club:Club;
  category:string; // Category's UUID

  int_id?:number;
  int_rating?:number;

  xz_id?:number;
  xz_rating?:number;

  cbx_id?:number;
  cbx_rating?:number;

  lbx_id?:number;
  lbx_rating?:number;

  fide_id?:number;
  fide_rating?:number;
}
