const database = require('../db/db');
const Rounds = require('../models/round.model');

const PlayersController = require('../controllers/player.controller');

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

async function create(event, event_uuid, round){
  try {
      let resultadoCreate = await Rounds.create({
          number: round.number
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
  let retorno_players = await PlayersController.listFromTournament(e,tournament_uuid);
  if(retorno_players.ok === 1){
    if(retorno_players.players.length > 1){
      let rounds_count = await getRoundsCount(e,tournament_uuid);

      let round_check = true;
      if(rounds_count.ok === 1){
        if(round_check.count > 0){
          let last_round = await getLastRound(e.tournament_uuid);

          if(last_round.ok === 1){

          }else{
            round_check = false;
          }
        }
      }else{
        round_check = false;
      }

      if(round_check){
        // DO PAIRING
      }
    }
  }
}
