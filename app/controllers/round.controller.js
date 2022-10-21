const database = require('../db/db');
const Rounds = require('../models/round.model');

const PlayersController = require('../controllers/player.controller');
const PairingsController = require('../controllers/pairing.controller');
const TournamentsController = require('../controllers/tournament.controller');

const dateHelper = require("../helpers/date.helper");
const { last } = require('rxjs');

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('model.rounds.listAll', listAll)
  ipcMain.handle('model.rounds.listFromTournament', listFromTournament)
  ipcMain.handle('model.rounds.create', create)
  ipcMain.handle('model.rounds.get', get)
  ipcMain.handle('model.rounds.update', update)
  ipcMain.handle('model.rounds.getLastRound', getLastRound)
  ipcMain.handle('model.rounds.generateRound', generateRound)
}

async function create(event, tournament_uuid, round){
  try {
      let resultadoCreate = await Rounds.create({
          number: round.number,
          tournamentUuid: tournament_uuid
      })
      console.log(resultadoCreate);
      return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
    } catch (error) {
        console.log(error);
    }
}

async function listAll() {
  try {
    let rounds = await Rounds.findAll();
    let rounds_return = [];
    let i = 0;
    for(let round of rounds){
      let round_return = {
        uuid: round.uuid,
        number: round.number,
      };

      rounds_return[i++] = round_return;
    }
    return {ok:1,error:0,rounds:rounds_return};
  } catch (error) {
      console.log(error);
  }
}

async function listFromTournament(event,tournament_uuid) {
  try {
    let rounds = await Rounds.findAll({
      where: {
        tournamentUuid: tournament_uuid
      }
    });
    let rounds_return = [];
    let i = 0;
    for(let round of rounds){
      let round_return = {
        uuid: round.uuid,
        number: round.number,
      };

      rounds_return[i++] = round_return;
    }
    return {ok:1,error:0,rounds:rounds_return};
  } catch (error) {
      console.log(error);
  }
}


async function get(e,uuid) {
  try {
    let round = await Rounds.findByPk(uuid);

    let round_return = {
      uuid: round.uuid,
      number: round.number,
    };

    return {ok:1,error:0,round:round_return};
  } catch (error) {
      console.log(error);
  }
}
async function getByNumber(e,tournament_uuid,number) {
  try {
    let round = await Rounds.findOne({
      where:{
        number:number,
        tournamentUuid: tournament_uuid
      }
    });

    if(round){
      let round_return = {
        uuid: round.uuid,
        number: round.number,
      };

      return {ok:1,error:0,round:round_return};
    }
  } catch (error) {
      console.log(error);
  }
  return {ok:0,error:1,message:"Rodada não encontrada"};
}

async function update(e,round){
  try {
      let resultado = await Rounds.update({
          number: round.number,
      },{
        where:{
          uuid: round.uuid
        }
      })
      console.log(resultado);
      return {ok:1,error:0};
    } catch (error) {
        console.log(error);
    }

}



async function getLastRound(e,tournament_uuid) {
  try {
    let round = await Rounds.findOne({
      where: {
        tournamentUuid: tournament_uuid
      },
      order:[
        ["number","DESC"],
      ]
    });

    let round_return = {
      uuid: round.uuid,
      number: round.number,
    };

    return {ok:1,error:0,round:round_return};
  } catch (error) {
      console.log(error);
  }
}

async function getRoundsCount(e,tournament_uuid) {
  try {
    let count = await Rounds.count({
      where: {
        tournamentUuid: tournament_uuid
      }
    });

    return {ok:1,error:0,count:count};
  } catch (error) {
      console.log(error);
  }
}

async function generateRound(e,tournament_uuid){
  console.log("generateRound");
  let retorno_tournament = await TournamentsController.get(e,tournament_uuid);
  if(retorno_tournament.ok === 1){
    let tournament = retorno_tournament.tournament;

    let retorno_players = await PlayersController.listFromTournament(e,tournament_uuid);
    if(retorno_players.ok === 1){
      if(retorno_players.players.length > 1){
        switch(tournament.tournament_type){
          case "SWISS":
            return generateRoundSwiss(tournament);
          case "SCHURING":
            return generateRoundSchuring(tournament);
        }
      }
    }
  }
}


async function generateRoundSwiss(tournament){
  console.log("generateRoundSwiss");
  let rounds_count = await getRoundsCount(null,tournament.uuid);

  let round_check = true;
  let round_number = 1;
  if(rounds_count.ok === 1){
    if(round_check.count > 0){
      let last_round = await getLastRound(e.tournament.uuid);

      if(last_round.ok === 1){
        round_number = last_round.round.round_number + 1;
      }else{
        round_check = false;
      }
    }
  }else{
    round_check = false;
  }

  if(round_check){
    // DO PAIRING
    if(round_number == 1){
      return generateFirstRoundSwiss(tournament);
    }
  }

}

async function generateFirstRoundSwiss(tournament){
  console.log("generateFirstRoundSwiss");
  let pairings = [];

  let retorno_players = await PlayersController.listFromTournament(null,tournament.uuid,["START_NUMBER","ALPHABETICAL"]);
  if(retorno_players.ok === 1){
    console.log("retorno_players");
    let total_players = retorno_players.players.length;

    let list_one_count = 0;
    let list_two_count = 0;
    if(total_players % 2 === 0){
      list_one_count = total_players/2;
      list_two_count = total_players/2;
    }else{
      list_two_count = (total_players+1)/2;
      list_one_count = total_players - list_two_count;
    }

    let list_one = [];
    let list_two = [];

    let i = 1;
    let j = 1;
    for(let player of retorno_players.players){
      if(i <= list_one_count){
        list_one[j++] = player;
        if(i === list_one_count){
          j = 1;
        }
        i++;
      }else{
        list_two[j++] = player;
        i++;
      }
    }

    let l = 0;
    for(let k = 1; k <= list_one_count; k++){
      let pairing = [];
      if(k % 2 === 1){
        pairing[0] = list_one[k];
        pairing[1] = list_two[k];
      }else{
        pairing[0] = list_two[k];
        pairing[1] = list_one[k];
      }
      pairings[l++] = pairing;
    }

    if(list_one_count < list_two_count){
      pairings[l++] = [list_two[list_one_count + 1],null];
    }


    return saveSwissPairings(tournament,1,pairings);
  }
}

async function saveSwissPairings(tournament,number,pairings){
  console.log("saveSwissPairings");
  let round_check = await getByNumber(null,tournament.uuid,number);
  if(round_check.ok === 0){
    let round_create = await create(null,tournament.uuid,{number:number});
    if(round_create.ok === 1){
      let round_uuid = round_create.data.uuid;
      let i = 1;
      for(let pairing of pairings){
        let request_pairing = {
          number: i++,
          player_a_uuid: pairing[0].uuid,
          player_b_uuid: (pairing[1]) ? pairing[1].uuid : null,
        };

        let pairing_create = await PairingsController.create(null,round_uuid,request_pairing);
      }

      return {ok:1,error:0};
    }
  }
  return {ok:0,error:1,message:"Erro ainda desconhecido"};
}

async function generateRoundSchuring(){

}
