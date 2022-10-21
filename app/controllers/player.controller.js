const database = require('../db/db');
const Players = require('../models/player.model');
const CategoriesController = require('../controllers/category.controller');
const TournamentsController = require('../controllers/tournament.controller');

const dateHelper = require("../helpers/date.helper");
const orderingHelper = require("../helpers/ordering.helper");
const Tournaments = require('../models/tournament.model');

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('model.players.listAll', listAll)
  ipcMain.handle('model.players.listByTournament', listFromTournament)
  ipcMain.handle('model.players.create', create)
  ipcMain.handle('model.players.get', get)
  ipcMain.handle('model.players.update', update)
  ipcMain.handle('model.players.remove', remove)
  ipcMain.handle('model.players.reorderPlayers', reorderPlayers)
}

module.exports.listAll = listAll;
module.exports.listByTournament = listFromTournament;
module.exports.listFromTournament = listFromTournament;
module.exports.create = create;
module.exports.get = get;
module.exports.update = update;
module.exports.remove = remove;
module.exports.reorderPlayers = reorderPlayers;

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
      })
      console.log(resultadoCreate);
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
      let category_get = await CategoriesController.get(null,player.categoryUuid);

      let player_return = {
        uuid: player.uuid,
        start_number: player.start_number,
        name: player.name,
        city: player.city,
        club: player.club,
        category: (category_get.ok === 1) ? category_get.category : null,

        borndate: (player.borndate) ? dateHelper.convertToBr(player.borndate) : null,

        int_id: player.int_id,
        int_rating: player.int_rating,

        xz_id: player.xz_id,
        xz_rating: player.xz_rating,

        nat_id: player.nat_id,
        nat_rating: player.nat_rating,

        fide_id: player.fide_id,
        fide_rating: player.fide_rating,

        category_uuid: player.categoryUuid,
      };

      players_return[i++] = player_return;
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
      let category_get = await CategoriesController.get(null,player.categoryUuid);

      let player_return = {
        uuid: player.uuid,
        start_number: player.start_number,
        name: player.name,
        city: player.city,
        club: player.club,
        category: (category_get.ok === 1) ? category_get.category : null,

        borndate: (player.borndate) ? dateHelper.convertToBr(player.borndate) : null,

        int_id: player.int_id,
        int_rating: player.int_rating,

        xz_id: player.xz_id,
        xz_rating: player.xz_rating,

        nat_id: player.nat_id,
        nat_rating: player.nat_rating,

        fide_id: player.fide_id,
        fide_rating: player.fide_rating,

        category_uuid: player.categoryUuid,
      };

      players_return[i++] = player_return;
    }
    return {ok:1,error:0,players:players_return};
  } catch (error) {
      console.log(error);
  }
}


async function get(e,uuid) {
  try {
    let player = await Players.findByPk(uuid);

    let category_get = await CategoriesController.get(null,player.categoryUuid);

    let player_return = {
      uuid: player.uuid,
      start_number: player.start_number,
      name: player.name,
      city: player.city,
      club: player.club,
      category: (category_get.ok === 1) ? category_get.category : null,

      borndate: (player.borndate) ? dateHelper.convertToBr(player.borndate) : null,

      int_id: player.int_id,
      int_rating: player.int_rating,

      xz_id: player.xz_id,
      xz_rating: player.xz_rating,

      nat_id: player.nat_id,
      nat_rating: player.nat_rating,

      fide_id: player.fide_id,
      fide_rating: player.fide_rating,

      category_uuid: player.categoryUuid,
    };

    return {ok:1,error:0,player:player_return};
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
      },{
        where:{
          uuid:player.uuid
        }
      })
      console.log(resultado);
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
