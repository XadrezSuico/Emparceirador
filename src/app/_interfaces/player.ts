import { Category } from './category';
import { City } from './city';
import { Club } from './club';

export interface Player{
  uuid:string;
  id?:number;
  name:string;
  start_number:number;
  borndate?:Date;

  city:City;
  club:Club;
  category?:Category; // Category's UUID
  category_uuid:string; // Category's UUID

  int_id?:number;
  int_rating?:number;

  xz_id?:number;
  xz_rating?:number;

  nat_id?:number;
  nat_rating?:number;

  fide_id?:number;
  fide_rating?:number;
}
