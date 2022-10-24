const database = require('../db/db');
const Players = require('../models/player.model');
const CategoriesController = require('../controllers/category.controller');
const TournamentsController = require('../controllers/tournament.controller');
const PairingsController = require('../controllers/pairing.controller');
const RoundsController = require('../controllers/round.controller');

const dateHelper = require("../helpers/date.helper");
const orderingHelper = require("../helpers/ordering.helper");
const PlayerDTO = require("../dto/player.dto");
const Tournaments = require('../models/tournament.model');
const Categories = require('../models/category.model');
const Standings = require('../models/standing.model');

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('controller.players.listAll', listAll)
  ipcMain.handle('controller.players.listByTournament', listFromTournament)
  ipcMain.handle('controller.players.listFromTournamentByPoints', listFromTournamentByPoints)
  ipcMain.handle('controller.players.create', create)
  ipcMain.handle('controller.players.get', get)
  ipcMain.handle('controller.players.update', update)
  ipcMain.handle('controller.players.remove', remove)
  ipcMain.handle('controller.players.reorderPlayers', reorderPlayers)
}

module.exports.listAll = listAll;
module.exports.listByTournament = listFromTournament;
module.exports.listFromTournament = listFromTournament;
module.exports.listFromTournamentByPoints = listFromTournamentByPoints;
module.exports.create = create;
module.exports.get = get;
module.exports.update = update;
module.exports.remove = remove;
module.exports.reorderPlayers = reorderPlayers;
module.exports.generateTemporaryTournamentInfos = generateTemporaryTournamentInfos;

async function create(event, tournament_uuid, player){
  try {
      let resultadoCreate = await Players.create({
        name: player.name,
        city: player.city,
        club: player.club,

        start_number: (await getLastNumber(tournament_uuid)) + 1,

        borndate: (player.borndate) ? dateHelper.convertToSql(player.borndate) : null,

        int_id: player.int_id,
        int_rating: player.int_rating,

        xz_id: player.xz_id,
        xz_rating: player.xz_rating,

        nat_id: player.nat_id,
        nat_rating: player.nat_rating,

        fide_id: player.fide_id,
        fide_rating: player.fide_rating,

        categoryUuid: player.category_uuid,
        tournamentUuid: tournament_uuid,

        temporary_tournament_info: player.temporary_tournament_info,
      })
      // console.log(resultadoCreate);
      return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
    } catch (error) {
        console.log(error);
    }
}

async function listAll() {
  try {
    let players = await Players.findAll();
    let players_return = [];
    let i = 0;
    for(let player of players){
      players_return[i++] = await PlayerDTO.convertToExport(player);
    }
    return {ok:1,error:0,players:players_return};
  } catch (error) {
      console.log(error);
  }
}

async function listFromTournament(event,tournament_uuid, orderings = []) {
  try {
    let players;
    if(orderings.length > 0){
      let orders = [];

      let j = 0;
      for(let ordering of orderings){
        let ordering_sql = orderingHelper.orderingSqlField(ordering);
        if(ordering_sql){
          orders[j++] = ordering_sql;
        }
      }

      players = await Players.findAll({
        where: {
          tournamentUuid: tournament_uuid
        },
        order: orders
      });
    }else{
      players = await Players.findAll({
        where: {
          tournamentUuid: tournament_uuid
        }
      });
    }


    let players_return = [];
    let i = 0;
    for(let player of players){
      players_return[i++] = await PlayerDTO.convertToExport(player);
    }
    return {ok:1,error:0,players:players_return};
  } catch (error) {
      console.log(error);
  }
}


async function listFromTournamentByPoints(event,tournament_uuid, orderings = []) {
  try {
    let players;

    if(orderings.length > 0){
      let orders = [];

      let j = 0;
      for(let ordering of orderings){
        let ordering_sql = orderingHelper.orderingSqlField(ordering);
        if(ordering_sql){
          orders[j++] = ordering_sql;
        }
      }

      players = await Players.findAll({
        where: {
          tournamentUuid: tournament_uuid
        },
        order: orders,

        include: [
          {
            model: Categories,
            as: 'category'
          },
          {
            model: Standings,
            as: 'standings',
            order: [
              ["round_number", "DESC"]
            ]
          }
        ]
      });
    }else{
      players = await Players.findAll({
        where: {
          tournamentUuid: tournament_uuid
        },

        include: [
          {
            model: Categories,
            as: 'category'
          },
          {
            model: Standings,
            as: 'standings',
            order:[
              ["round_number","DESC"]
            ]
          }
        ]
      });
    }


    let groups_return = [];
    let i = [];
    for(let player of players){
      console.log(player)
      let standing = player.standings[0];

      console.log(standing.points);

      if (!i[standing.points]){
        i[standing.points] = 0;
      }

      if (!groups_return[String(standing.points)]){
        groups_return[String(standing.points)] = [];
      }

      groups_return[String(standing.points)][(i[standing.points]++)] = await PlayerDTO.convertToExport(player);
    }
    return {ok:1,error:0,group_points:groups_return};
  } catch (error) {
      console.log(error);
  }
  return {ok:0,error:1,message:"Erro desconhecido"};
}

async function get(e,uuid) {
  try {
    let player = await Players.findByPk(uuid);

    let category_get = await CategoriesController.get(null,player.categoryUuid);

    return { ok: 1, error: 0, player: await PlayerDTO.convertToExport(player) };
  } catch (error) {
      console.log(error);
  }
}

async function update(e,player){
  try {
      let resultado = await Players.update({
        start_number: player.start_number,

        name: player.name,
        city: player.city,
        club: player.club,

        borndate: (player.borndate) ? dateHelper.convertToSql(player.borndate) : null,

        int_id: player.int_id,
        int_rating: player.int_rating,

        xz_id: player.xz_id,
        xz_rating: player.xz_rating,

        nat_id: player.nat_id,
        nat_rating: player.nat_rating,

        fide_id: player.fide_id,
        fide_rating: player.fide_rating,

        categoryUuid: player.category_uuid,

        temporary_tournament_info: player.temporary_tournament_info,
      },{
        where:{
          uuid:player.uuid
        }
      })
      // console.log(resultado);
      return {ok:1,error:0};
    } catch (error) {
        console.log(error);
    }

}

async function getLastNumber(tournament_uuid){
  let retorno = await listFromTournament(null,tournament_uuid);
  if(retorno.ok == 1){
    if(retorno.players.length > 0){
      return retorno.players.length;
    }
  }
  return 0;
}

async function remove(e,uuid) {
  try {
    let player = await Players.findByPk(uuid);

    if(player){
      Players.destroy({
        where: {
          uuid: uuid
        }
      });
      return {ok:1,error:0};
    }else{
      return {ok:0,error:1,message:"Jogador não encontrado"};
    }

  } catch (error) {
      console.log(error);
  }
}


async function reorderPlayers(e,tournament_uuid) {
  try {
    let retorno_tournament = await TournamentsController.get(null,tournament_uuid);
    if(retorno_tournament.ok === 1){
      let tournament = retorno_tournament.tournament;

      let retorno_players = await listFromTournament(e,tournament_uuid);

      if(retorno_players.ok === 1){
        for(let player of retorno_players.players){
          player.start_number = 0;

          update(null,player);
        }

        let retorno_players_to_order = await listFromTournament(e,tournament_uuid,tournament.ordering_sequence);

        if(retorno_players_to_order.ok === 1){
          i = 1;
          for(let player of retorno_players_to_order.players){
            player.start_number = i++;
            console.log(player.start_number);

            update(null,player);
          }
        }
      }


      return {ok:1,error:0};
    }
    return {ok:0,error:1,message:""};

  } catch (error) {
      console.log(error);
  }
}

async function generateTemporaryTournamentInfos(e,tournament_uuid){
  // let players_return = await listFromTournament(null, tournament_uuid);
  // if(players_return.ok === 1){
  //   for(let player of players_return.players){
  //     player.temporary_tournament_info = [{points:0}];

  //     let rounds_return = await RoundsController.listFromTournament(null,tournament_uuid);
  //     if(rounds_return.ok === 1){
  //       for(let ri = 0; ri < rounds_return.rounds.length; ri++){
  //         let round = rounds_return.rounds[ri];
  //         player.temporary_tournament_info[round.number] = {
  //           points: 0
  //         }

  //         let pairings_return = await PairingsController.listPlayerPairings(null,tournament_uuid,player.uuid, round.number);
  //         console.log(pairings_return);
  //         if(pairings_return.ok === 1){
  //           for(let player_pairing of pairings_return.player_pairings){
  //             if(player_pairing){
  //               if(player_pairing.place === "a"){
  //                 if(!player_pairing.pairing.player_a_wo){
  //                   player.temporary_tournament_info[round.number].points = player.temporary_tournament_info[round.number].points + player_pairing.pairing.player_a_result;
  //                 }
  //               }else{
  //                 if(!player_pairing.pairing.player_b_wo){
  //                   player.temporary_tournament_info[round.number].points = player.temporary_tournament_info[round.number].points + player_pairing.pairing.player_b_result;
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }


  //     await update(null,player);
  //   }
  //   return {ok:1,error:0};
  // }
  return {ok:0,error:1,message:"Erro desconhecido"};
}
