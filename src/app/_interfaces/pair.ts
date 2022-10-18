export interface Pair{
  uuid:number;
  id?:number;
  number:number; // table's number

  player_a:string; // player's uuid
  player_a_result?:number; // 1, 0.5, 0
  player_a_wo:boolean;

  player_b:string; // player's uuid
  player_b_result?:number; // 1, 0.5, 0
  player_b_wo:boolean;
}
