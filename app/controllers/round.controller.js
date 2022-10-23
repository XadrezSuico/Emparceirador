const database = require('../db/db');
const Rounds = require('../models/round.model');

const PlayersController = require('../controllers/player.controller');
const PairingsController = require('../controllers/pairing.controller');
const TournamentsController = require('../controllers/tournament.controller');

const dateHelper = require("../helpers/date.helper");
const pairingHelper = require("../helpers/pairing.helper");
const { last } = require('rxjs');

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('model.rounds.listAll', listAll)
  ipcMain.handle('model.rounds.listFromTournament', listFromTournament)
  ipcMain.handle('model.rounds.create', create)
  ipcMain.handle('model.rounds.get', get)
  ipcMain.handle('model.rounds.update', update)
  ipcMain.handle('model.rounds.getLastRound', getLastRound)
  ipcMain.handle('model.rounds.getByNumber', getByNumber)
  ipcMain.handle('model.rounds.generateRound', generateRound)
  ipcMain.handle('model.rounds.canGenerateNewRound', canGenerateNewRound)
}

module.exports.listAll = listAll;
module.exports.listFromTournament = listFromTournament;
module.exports.listByTournament = listFromTournament;
module.exports.create = create;
module.exports.get = get;
module.exports.update = update;
module.exports.getLastRound = getLastRound;
module.exports.getByNumber = getByNumber;
module.exports.generateRound = generateRound;
module.exports.canGenerateNewRound = canGenerateNewRound;

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
        tournament_uuid: round.tournamentUuid,
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
        tournament_uuid: round.tournamentUuid,
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
      tournament_uuid: round.tournamentUuid,
    };

    return {ok:1,error:0,round:round_return};
  } catch (error) {
      console.log(error);
  }
}

async function getByNumber(e,tournament_uuid,number) {
  try {
    let round = await Rounds.findOne({
      where: {
        tournamentUuid:tournament_uuid,
        number:number
      }
    });

    if(round){
      let round_return = {
        uuid: round.uuid,
        number: round.number,
        tournament_uuid: round.tournamentUuid,
      };

      return {ok:1,error:0,round:round_return};
    }
    return {ok:0,error:1,message:"Rodada não encontrada"}
  } catch (error) {
      console.log(error);
  }
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
    console.log("getLastRound")
    let round = await Rounds.findOne({
      where: {
        tournamentUuid: tournament_uuid
      },
      order:[
        ["number","DESC"],
      ]
    });

    console.log(round)

    let round_return = {
      uuid: round.uuid,
      number: round.number,
      tournament_uuid: round.tournamentUuid,
    };

    console.log("Last Round: ")
    console.log(round_return)

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

    console.log("Count: ".concat(String(count)));

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
  if(rounds_count.ok === 1){
    if(rounds_count.count > 0){
      console.log("Rounds count: ".concat(rounds_count.count))
      console.log(tournament);
      let last_round = await getLastRound(null,tournament.uuid);

      console.log(last_round)

      if(last_round.ok === 1){
        if(tournament.rounds_number > last_round.round.number){
          return generateAnotherRoundSwiss(tournament);
        }else{
          return {ok:0,error:1,message:"O torneio conforme configuração não permite novas rodadas."};
        }
      }else{
        return {ok:0,error:1,message:"Houve um problema na requisição de geração de nova rodada."};
      }
    }else{
      return generateFirstRoundSwiss(tournament);
    }
  }
  return {ok:0,error:1,message:"Erro desconhecido"};
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


async function generateAnotherRoundSwiss(tournament){
  console.log("generateAnotherRoundSwiss");
  let pairings = [];

  let retorno_groups_lists = await PlayersController.listFromTournamentByPoints(null,tournament.uuid,["START_NUMBER","ALPHABETICAL"]);

  if(retorno_groups_lists.ok === 1){
    let retorno_last_round = await getLastRound(null,tournament.uuid);
    if(retorno_last_round.ok === 1){

      let group_lists = retorno_groups_lists.group_points;

      let possible_results = await pairingHelper.getAllResultsPossible(retorno_last_round.round.number);

      console.log(possible_results);

      let l = 0;
      for(let psi = 0; psi < possible_results.length; psi++){
        let possible_result = possible_results[psi];
        console.log("Results: ".concat(String(possible_result)));
        if(group_lists[possible_result]){
          console.log("Players: ");
          console.log(group_lists[possible_result]);
          let players = group_lists[possible_result];
          let total_players = players.length;

          let list_one_count = 0;
          let list_two_count = 0;

          let list_one = [];
          let list_two = [];

          if(total_players % 2 === 0){
            list_one_count = total_players/2;
            list_two_count = total_players/2;
          }else{
            if(possible_result == 0){
              list_two_count = (total_players+1)/2;
              list_one_count = total_players - list_two_count;
            }else{
              let found = false;
              for(let psi_temp = psi+1; psi_temp < possible_results.length && !found; psi_temp++){
                let possible_result_temp = possible_results[psi_temp];
                if(group_lists[possible_result_temp]){
                  players[players.length] = group_lists[possible_result_temp][0];
                  let temp_group_list = group_lists[possible_result_temp];
                  console.log(temp_group_list);
                  temp_group_list.shift();
                  console.log(temp_group_list);
                  group_lists[possible_result_temp] = temp_group_list;
                  found = true;
                }
              }
              total_players = players.length;

              list_one_count = total_players/2;
              list_two_count = total_players/2;
            }
          }


          let i = 1;
          let j = 1;
          for(let player of players){
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

        }
      }

      return saveSwissPairings(tournament,retorno_last_round.round.number + 1,pairings);
    }
  }

  return {ok:1};

  return null;
  if(retorno_groups_lists.ok === 1){
    players =
    console.log("retorno_players");
    let total_players = retorno_groups_lists.players.length;

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

      return {ok:1,error:0,data:{number:number,uuid:round_uuid}};
    }
  }
  return {ok:0,error:1,message:"Erro ainda desconhecido"};
}

async function generateRoundSchuring(){

}

async function canGenerateNewRound(e, tournament_uuid){
  let tournament_request = await TournamentsController.get(null,tournament_uuid)
  if(tournament_request.ok === 1){
    let tournament = tournament_request.tournament;
    let get_last_round = await getLastRound(null,tournament_uuid);
    if(get_last_round.ok === 1){
      let last_round = get_last_round.round;
      if(tournament.tournament_type == "SWISS"){
        if(tournament.rounds_number === last_round.number){
          return {ok:1,error:0,result:false,message:"Última rodada, não é possível gerar nova rodada"}
        }else{
          let get_is_all_pairings_with_result = await PairingsController.isAllPairingsWithResult(null,last_round.uuid);
          if(get_is_all_pairings_with_result.ok === 1){
            if(get_is_all_pairings_with_result.result){
              return {ok:1,error:0,result:true}
            }else{
              return {ok:1,error:0,result:false,message:get_is_all_pairings_with_result.message}
            }
          }
        }
      }
    }
  }
  return {ok:0,error:1,message:"Erro inesperado"}
}
