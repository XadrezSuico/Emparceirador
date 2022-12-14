import { Category } from "./category";
import { Player } from "./player";
import { Round } from "./round";
import { Ordering } from "./_enums/_ordering";
import { Tiebreak } from "./_enums/_tiebreak";
import { TournamentType } from "./_enums/_tournament_type";

export interface Tournament{
  uuid:string;
  id?:number;
  name:string;
  tournament_type:TournamentType;
  rounds_number?:number;
  table_start_number?:number;

  event_uuid?:string;

  tiebreaks?:Array<Tiebreak>;

  categories?:Array<Category>;

  players?:Array<Player>;

  rounds?:Array<Round>;

  ordering_sequence?:Array<Ordering>;
}
