const database = require('../db/db');
const Standings = require('../models/standing.model');

const dateHelper = require("../helpers/date.helper");

const StandingDTO = require("../dto/standing.dto")

const Players = require('../models/player.model');
const Rounds = require('../models/round.model');
const Tournaments = require('../models/tournament.model');
const Categories = require('../models/category.model');

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('controller.standings.listAll', listAll)
  ipcMain.handle('controller.standings.listFromPlayer', listFromPlayer)
  ipcMain.handle('controller.standings.listFromTournament', listFromTournament)
  ipcMain.handle('controller.standings.listFromRound', listFromRound)
  ipcMain.handle('controller.standings.listFromCategory', listFromCategory)
  ipcMain.handle('controller.standings.get', get)
  ipcMain.handle('controller.standings.removeByRound', removeByRound)
}

module.exports.create = create;
module.exports.listAll = listAll;
module.exports.listFromPlayer = listFromPlayer;
module.exports.listFromTournament = listFromTournament;
module.exports.listFromRound = listFromRound;
module.exports.listFromCategory = listFromCategory;
module.exports.get = get;
module.exports.getFromPlayerAndRound = getFromPlayerAndRound;
module.exports.update = update;
module.exports.remove = remove;
module.exports.removeByRound = removeByRound;

async function create(event, standing){
  try {
        await database.sync();

        const resultadoCreate = await Standings.create({
            round_number: standing.round_number,
            place: standing.place,
            category_place: standing.category_place,
            points: standing.points,
            tiebreaks: standing.tiebreaks,

            tournamentUuid: standing.tournament_uuid,
            playerUuid: standing.player_uuid,
            categoryUuid: standing.category_uuid,
            roundUuid: standing.round_uuid,
        })
        return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
    } catch (error) {
        console.log(error);
    }
}

async function listAll() {
  try {
    const standings = await Standings.findAll();
    let standings_return = [];
    let i = 0;
    for(let standing of standings){
      let standing_return = {
        uuid: standing.uuid,
        place: standing.place,
        category_place: standing.category_place,
        round_number: standing.round_number,
        points: standing.points,
        tiebreaks: standing.tiebreaks,
        tournament_uuid: standing.tournamentUuid,
        player_uuid: standing.playerUuid,
        category_uuid: standing.categoryUuid,
        round_uuid: standing.roundUuid,
      };

      standings_return[i++] = standing_return;
    }
    return {ok:1,error:0,standings:standings_return};
  } catch (error) {
      console.log(error);
  }
}
async function listFromTournament(e,tournament_uuid) {
  try {
    const standings = await Standings.findAll({
      where:{
        tournamentUuid:tournament_uuid
      },
      order:[
        ["place","ASC"]
      ]
    });
    let standings_return = [];
    let i = 0;
    for(let standing of standings){
      let standing_return = {
        uuid: standing.uuid,
        place: standing.place,
        category_place: standing.category_place,
        round_number: standing.round_number,
        points: standing.points,
        tiebreaks: standing.tiebreaks,
        tournament_uuid: standing.tournamentUuid,
        player_uuid: standing.playerUuid,
        category_uuid: standing.categoryUuid,
        round_uuid: standing.roundUuid,
      };

      standings_return[i++] = standing_return;
    }
    return {ok:1,error:0,standings:standings_return};
  } catch (error) {
      console.log(error);
  }
}

async function listFromPlayer(e,tournament_uuid,player_uuid) {
  try {
    const standings = await Standings.findAll({
      where:{
        tournamentUuid:tournament_uuid,
        playerUuid:player_uuid,
      },
      order:[
        ["round_number","ASC"]
      ]
    });
    let standings_return = [];
    let i = 0;
    for(let standing of standings){
      let standing_return = {
        uuid: standing.uuid,
        place: standing.place,
        category_place: standing.category_place,
        round_number: standing.round_number,
        points: standing.points,
        tiebreaks: standing.tiebreaks,
        tournament_uuid: standing.tournamentUuid,
        player_uuid: standing.playerUuid,
        category_uuid: standing.categoryUuid,
        round_uuid: standing.roundUuid,
      };

      standings_return[i++] = standing_return;
    }
    return {ok:1,error:0,standings:standings_return};
  } catch (error) {
      console.log(error);
  }
}

async function listFromRound(e,tournament_uuid,round_uuid) {
  try {
    let standings = await Standings.findAll({
      where:{
        tournamentUuid:tournament_uuid,
        roundUuid:round_uuid,
      },
      order:[
        ["place","ASC"]
      ],
      include:[
        {
          model: Players,
          as: "player"
        },
        {
          model: Rounds,
          as: "round"
        },
        {
          model: Tournaments,
          as: "tournament"
        },
        {
          model: Categories,
          as: "category"
        }
      ]
    });
    // console.log(standings);
    return { ok: 1, error: 0, standings: await StandingDTO.convertToExportList(standings) };

  } catch (error) {
      console.log(error);
  }
}

async function listFromCategory(e,tournament_uuid,category_uuid=null,round_uuid=null) {
  try {
    let where = {
      tournamentUuid: tournament_uuid
    };
    if(category_uuid){
      where.categoryUuid = category_uuid
    }
    if(round_uuid){
      where.roundUuid = round_uuid
    }
    const standings = await Standings.findAll({
      where:where,
      order:[
        ["round_number","ASC"]
      ]
    });
    let standings_return = [];
    let i = 0;
    for(let standing of standings){
      let standing_return = {
        uuid: standing.uuid,
        place: standing.place,
        category_place: standing.category_place,
        round_number: standing.round_number,
        points: standing.points,
        tiebreaks: standing.tiebreaks,
        tournament_uuid: standing.tournamentUuid,
        player_uuid: standing.playerUuid,
        category_uuid: standing.categoryUuid,
        round_uuid: standing.roundUuid,
      };

      standings_return[i++] = standing_return;
    }
    return {ok:1,error:0,standings:standings_return};
  } catch (error) {
      console.log(error);
  }
}

async function get(e,uuid) {
  try {
    const standing = await Standings.findByPk(uuid);

    let standing_return = {
      uuid: standing.uuid,
      round_number: standing.round_number,
      place: standing.place,
      category_place: standing.category_place,
      name: standing.name,
      date_start: dateHelper.convertToBr(standing.date_start),
      date_finish: dateHelper.convertToBr(standing.date_finish),
      place: standing.place,
      time_control: standing.time_control
    };

    return {ok:1,error:0,standing:standing_return};
  } catch (error) {
      console.log(error);
  }
}

async function getFromPlayerAndRound(e, tournament_uuid, round_uuid, player_uuid) {
  try {
    const standing = await Standings.findOne({
      where:{
        tournamentUuid: tournament_uuid,
        roundUuid: round_uuid,
        playerUuid: player_uuid
      }
    });

    if(standing){
      return { ok: 1, error: 0, standing: await StandingDTO.convertToExport(standing) };
    }
    return {ok:0,error:1,message:"Classificação não encontrada"};

  } catch (error) {
    console.log(error);
  }
}


async function update(e,standing){
  try {
      let resultado = await Standings.update({
        round_number: standing.round_number,
        place: standing.place,
        category_place: standing.category_place,
        points: standing.points,
        tiebreaks: standing.tiebreaks,
      },{
        where:{
          uuid:standing.uuid
        }
      })
      // console.log(resultado);
      return {ok:1,error:0};
    } catch (error) {
        console.log(error);
    }

}
async function remove(e,uuid) {
  try {
    let standing = await Standings.findByPk(uuid);

    if(standing){
      Standings.destroy({
        where: {
          uuid: uuid
        }
      });
      return {ok:1,error:0};
    }else{
      return {ok:0,error:1,message:"Classificação não encontrada"};
    }

  } catch (error) {
      console.log(error);
  }
}
async function removeByRound(e, round_uuid) {
  try {
    Standings.destroy({
      where: {
        roundUuid: round_uuid
      }
    });
    return { ok: 1, error: 0 };

  } catch (error) {
    console.log(error);
  }
}
