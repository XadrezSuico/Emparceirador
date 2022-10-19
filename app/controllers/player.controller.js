const database = require('../db/db');
const Players = require('../models/player.model');

const dateHelper = require("../helpers/date.helper");

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('model.players.listAll', listAll)
  ipcMain.handle('model.players.listFromTournament', listFromTournament)
  ipcMain.handle('model.players.create', create)
  ipcMain.handle('model.players.get', get)
  ipcMain.handle('model.players.update', update)
}

async function create(event, tournament_uuid, player){
  try {
      let resultadoCreate = await Players.create({
        name: player.name,
        firstname: player.firstname,
        lastname: player.lastname,
        city: player.city,
        club: player.club,

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
      let player_return = {
        name: player.name,
        firstname: player.firstname,
        lastname: player.lastname,
        city: player.city,
        club: player.club,

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

async function listFromTournament(event,tournament_uuid) {
  try {
    let players = await Players.findAll({
      where: {
        tournamentUuid: tournament_uuid
      }
    });
    let players_return = [];
    let i = 0;
    for(let player of players){
      let player_return = {
        name: player.name,
        firstname: player.firstname,
        lastname: player.lastname,
        city: player.city,
        club: player.club,

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

    let player_return = {
      name: player.name,
      firstname: player.firstname,
      lastname: player.lastname,
      city: player.city,
      club: player.club,

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

async function update(e,uuid,player){
  try {
      let resultado = await Players.update({
        name: player.name,
        firstname: player.firstname,
        lastname: player.lastname,
        city: player.city,
        club: player.club,

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
          uuid:uuid
        }
      })
      console.log(resultado);
      return {ok:1,error:0};
    } catch (error) {
        console.log(error);
    }

}
