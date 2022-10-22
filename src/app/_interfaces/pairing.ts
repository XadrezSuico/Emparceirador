export interface Pairing{
  uuid:number;
  id?:number;
  number:number; // table's number

  player_a_uuid:string; // player's uuid_uuid
  player_a_name?:string; // player's uuid
  player_a_result?:number; // 1, 0.5, 0
  player_a_wo:boolean;

  player_b_uuid:string; // player's uuid
  player_b_name?:string; // player's uuid
  player_b_result?:number; // 1, 0.5, 0
  player_b_wo:boolean;

  is_bye:boolean;
}
