const database = require('../db/db');
const Tournaments = require('../models/tournament.model');

const dateHelper = require("../helpers/date.helper");

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('model.tournaments.listAll', listAll)
  ipcMain.handle('model.tournaments.listFromEvent', listFromEvent)
  ipcMain.handle('model.tournaments.create', create)
  ipcMain.handle('model.tournaments.get', get)
}

async function create(event, event_uuid, tournament){
  try {
        const resultadoCreate = await Tournaments.create({
            name: tournament.name,
            tournament_type: tournament.tournament_type,
            rounds_number: tournament.rounds_number,
            eventUuid: event_uuid,
        })
        console.log(resultadoCreate);
        return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
    } catch (error) {
        console.log(error);
    }
}

async function listAll() {
  try {
    const tournaments = await Tournaments.findAll();
    let tournaments_return = [];
    let i = 0;
    for(let tournament of tournaments){
      let tournament_return = {
        uuid: tournament.uuid,
        name: tournament.name,
        tournament_type: tournament.tournament_type,
        rounds_number: tournament.rounds_number,
      };

      tournaments_return[i++] = tournament_return;
    }
    return {ok:1,error:0,tournaments:tournaments_return};
  } catch (error) {
      console.log(error);
  }
}

async function listFromEvent(event,event_uuid) {
  try {
    const tournaments = await Tournaments.findAll({
      where: {
        eventUuid: event_uuid
      }
    });
    let tournaments_return = [];
    let i = 0;
    for(let tournament of tournaments){
      let tournament_return = {
        uuid: tournament.uuid,
        name: tournament.name,
        tournament_type: tournament.tournament_type,
        rounds_number: tournament.rounds_number,
      };

      tournaments_return[i++] = tournament_return;
    }
    return {ok:1,error:0,tournaments:tournaments_return};
  } catch (error) {
      console.log(error);
  }
}


async function get(e,uuid) {
  try {
    const tournament = await Tournaments.findByPk(uuid);

    let tournament_return = {
      uuid: tournament.uuid,
      name: tournament.name,
      tournament_type: tournament.tournament_type,
      rounds_number: tournament.rounds_number,
    };

    return {ok:1,error:0,tournament:tournament_return};
  } catch (error) {
      console.log(error);
  }
}
