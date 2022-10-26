const database = require('../db/db');
const Tournaments = require('../models/tournament.model');

const PairingsController = require('./pairing.controller');

const dateHelper = require("../helpers/date.helper");

const TournamentDTO = require("../dto/tournament.dto");
const Categories = require('../models/category.model');

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('controller.tournaments.listAll', listAll)
  ipcMain.handle('controller.tournaments.listFromEvent', listFromEvent)
  ipcMain.handle('controller.tournaments.create', create)
  ipcMain.handle('controller.tournaments.get', get)
  ipcMain.handle('controller.tournaments.update', update)
}



module.exports.listAll = listAll;
module.exports.listFromEvent = listFromEvent;
module.exports.create = create;
module.exports.get = get;
module.exports.update = update;
module.exports.getPlayerPoints = getPlayerPoints;



async function create(event, event_uuid, tournament){
  try {
      let resultadoCreate = await Tournaments.create({
        name: tournament.name,
        tournament_type: tournament.tournament_type,
        rounds_number: tournament.rounds_number,
        table_start_number: (tournament.table_start_number) ? tournament.table_start_number : 1,
        eventUuid: event_uuid,
        ordering_sequence: (tournament.ordering_sequence) ? tournament.ordering_sequence : [],
        tiebreaks: (tournament.tiebreaks) ? tournament.tiebreaks : [],
      })
      // console.log(resultadoCreate);
      return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
    } catch (error) {
        console.log(error);
    }
}

async function listAll() {
  try {
    let tournaments = await Tournaments.findAll();
    let tournaments_return = [];
    let i = 0;
    for(let tournament of tournaments){
      let tournament_return = {
        uuid: tournament.uuid,
        name: tournament.name,
        tournament_type: tournament.tournament_type,
        rounds_number: tournament.rounds_number,
        table_start_number: tournament.table_start_number,
        ordering_sequence: tournament.ordering_sequence,
        tiebreaks: (tournament.tiebreaks) ? tournament.tiebreaks : [],
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
    let tournaments = await Tournaments.findAll({
      where: {
        eventUuid: event_uuid
      },
      include: {
        model: Categories,
        as: "categories"
      }
    });
    // console.log(tournaments);
    return { ok: 1, error: 0, tournaments: await TournamentDTO.convertToExportList(tournaments)};
  } catch (error) {
      console.log(error);
  }
}


async function get(e,uuid) {
  try {
    let tournament = await Tournaments.findOne({
      where:{
        uuid:uuid
      },
      include:{
        model:Categories,
        as:"categories"
      }
    });

    if(tournament){
      return { ok: 1, error: 0, tournament: await TournamentDTO.convertToExport(tournament) };
    }
  } catch (error) {
      console.log(error);
  }
  return { ok: 0, error: 1, message: "Torneio não encontrado" };
}


async function update(e,uuid,tournament){
  try {
      let resultado = await Tournaments.update({
        name: tournament.name,
        tournament_type: tournament.tournament_type,
        rounds_number: tournament.rounds_number,
        table_start_number: (tournament.table_start_number) ? tournament.table_start_number : 1,
        ordering_sequence: tournament.ordering_sequence,
        tiebreaks: (tournament.tiebreaks) ? tournament.tiebreaks : [],
      },{
        where:{
          uuid:uuid
        }
      })
      // console.log(resultado);
      return {ok:1,error:0};
    } catch (error) {
        console.log(error);
    }

}


async function getPlayerPoints(e,uuid,player_uuid) {
  try {
    let tournament = await Tournaments.findByPk(uuid);
    if(tournament){
      let player_pairings_request = await PairingsController.listPlayerPairings(null,uuid,player_uuid);

      if(player_pairings_request.ok === 1){
        return {ok:1,error:0,points:player_pairings_request.points};
      }
    }
  } catch (error) {
      console.log(error);
  }
  return {ok:0,error:1,message:"Erro desconhecido"}
}



function getDefaultOrdering(){
  [
    "FIDE_RATING",
    "NATIONAL_RATING",
    "XADREZSUICO_RATING",
    "INTERNAL_RATING",
    "BORNDATE",
    "ALPHABETICAL"
  ]
}
