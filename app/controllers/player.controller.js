const database = require('../db/db');
const fs = require('fs');
const path = require('path');

const Players = require('../models/player.model');
const Tournaments = require('../models/tournament.model');
const Categories = require('../models/category.model');
const Standings = require('../models/standing.model');

const CategoriesController = require('../controllers/category.controller');
const TournamentsController = require('../controllers/tournament.controller');
const PairingsController = require('../controllers/pairing.controller');
const RoundsController = require('../controllers/round.controller');

// const PlayerReports = require('../reports/player.report');

const dateHelper = require("../helpers/date.helper");
const orderingHelper = require("../helpers/ordering.helper");

const PlayerDTO = require("../dto/player.dto");

let window_pdf;

module.exports.setEvents = (ipcMain, pdf_window) => {
  database.sync();

  window_pdf = pdf_window;

  console.log(window_pdf);

  ipcMain.handle('controller.players.listAll', listAll)
  ipcMain.handle('controller.players.listByTournament', listFromTournament)
  ipcMain.handle('controller.players.listFromTournamentByPoints', listFromTournamentByPoints)
  ipcMain.handle('controller.players.create', create)
  ipcMain.handle('controller.players.get', get)
  ipcMain.handle('controller.players.update', update)
  ipcMain.handle('controller.players.remove', remove)
  ipcMain.handle('controller.players.reorderPlayers', reorderPlayers)
  ipcMain.handle('controller.players.generateReport', generateReport)
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
      let rounds_out = [];
      let tournament_request = await TournamentsController.get(null,tournament_uuid);
      if(tournament_request.ok === 1){
        if(tournament_request.tournament.tournament_type === "SWISS"){
          for(let i = 1; i<tournament_request.tournament.rounds_number;i++){
            rounds_out[i] = {
              status:true,
              points:0,
              not_registered: false
            }
          }
          let last_round_request = await RoundsController.getLastRound(null, tournament_uuid);
          if(last_round_request.ok === 1){
            for(let i = 1; i <= last_round_request.round.number; i++){
              rounds_out[i].status = false;
              rounds_out[i].not_registered = true;
              console.log(i);
            }
          }
        }
      }
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

        rounds_out: rounds_out,

        categoryUuid: player.category_uuid,
        tournamentUuid: tournament_uuid,
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
            order: [
              ["round_number", "DESC"]
            ]
          }
        ]
      });
    }

    return { ok: 1, error: 0, players: await PlayerDTO.convertToExportList(players)};
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
      // console.log(player)
      let standing = player.standings[0];

      let round_config;
      if (player.rounds_out) {
        if (player.rounds_out[standing.round_number + 1]){
          round_config = player.rounds_out[standing.round_number + 1];
        }else{
          round_config = {
            points:0,
            status:true
          }
          player.rounds_out[standing.round_number + 1] = round_config;
        }
      } else {
        round_config = {
          points: 0,
          status: true
        }
        player.rounds_out = [];
        player.rounds_out[standing.round_number + 1] = round_config;
      }

      if(round_config.status){
        // console.log(standing.points);

        if (!i[standing.points]) {
          i[standing.points] = 0;
        }

        if (!groups_return[String(standing.points)]) {
          groups_return[String(standing.points)] = [];
        }

        groups_return[String(standing.points)][(i[standing.points]++)] = await PlayerDTO.convertToExport(player);
      }else{
        if (!i[-1]) {
          i[-1] = 0;
        }

        if (!groups_return[String(-1)]) {
          groups_return[String(-1)] = [];
        }

        groups_return[String(-1)][(i[-1]++)] = await PlayerDTO.convertToExport(player);
      }
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
        rounds_out: player.rounds_out,
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
  if(retorno.ok === 1){
    if(retorno.players.length > 0){
      return retorno.players.length;
    }
  }
  return 0;
}

async function remove(e,uuid) {
  try {
    // console.log(uuid);
    let player = await Players.findByPk(uuid);

    if(player){
      let rows = await Players.destroy({
        where: {
          uuid: uuid
        }
      });
      if(rows === 1){
        return { ok: 1, error: 0 };
      }else{
        return { ok: 0, error: 1, message: "Erro ainda desconhecido" };
      }
    }else{
      return {ok:0,error:1,message:"Jogador não encontrado"};
    }

  } catch (error) {
      console.log(error);
  }
}

async function generateReport(e, tournament_uuid){
  try{
    let retorno = await listFromTournament(null, tournament_uuid);
    if (retorno.ok === 1) {
      let players = retorno.players;

      // Path when running electron executable
      let pathIndex = '../../index.html';

      if (fs.existsSync(path.join(__dirname, '../../dist/index.html'))) {
        // Path when running electron in local folder
        pathIndex = '../../dist/index.html';
      }

      const url = new URL(path.join('file:', __dirname, pathIndex));

      console.log(url);

      await window_pdf.loadURL(url.href.concat("?elec_route=print/tournament/".concat(tournament_uuid).concat("/players"))); //give the file link you want to display

      return {ok:1,error:0};
    }
  } catch(error) {
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
            // console.log(player.start_number);

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
