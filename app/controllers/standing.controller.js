const database = require('../db/db');
const fs = require('fs');
const path = require('path');
const Standings = require('../models/standing.model');

const dateHelper = require("../helpers/date.helper");

const StandingDTO = require("../dto/standing.dto")

const Players = require('../models/player.model');
const Rounds = require('../models/round.model');
const Tournaments = require('../models/tournament.model');
const Categories = require('../models/category.model');

const RoundsController = require("./round.controller");
const TournamentsController = require("./tournament.controller");

let window_pdf;
let pdf_window_func;

module.exports.setEvents = (ipcMain, pdf_window, __pdf_window_func) => {
  database.sync();

  window_pdf = pdf_window;
  pdf_window_func = __pdf_window_func;

  ipcMain.handle('controller.standings.listAll', listAll)
  ipcMain.handle('controller.standings.listFromPlayer', listFromPlayer)
  ipcMain.handle('controller.standings.listFromTournament', listFromTournament)
  ipcMain.handle('controller.standings.listFromRound', listFromRound)
  ipcMain.handle('controller.standings.listFromRoundNumber', listFromRoundNumber)
  ipcMain.handle('controller.standings.listFromCategory', listFromCategory)
  ipcMain.handle('controller.standings.listFromCategoryAndRoundNumber', listFromCategoryAndRoundNumber)
  ipcMain.handle('controller.standings.get', get)
  ipcMain.handle('controller.standings.removeByRound', removeByRound)

  ipcMain.handle('controller.standings.generateReport', generateReport)
}

module.exports.create = create;
module.exports.listAll = listAll;
module.exports.listFromPlayer = listFromPlayer;
module.exports.listFromTournament = listFromTournament;
module.exports.listFromRound = listFromRound;
module.exports.listFromRoundNumber = listFromRoundNumber;
module.exports.listFromCategory = listFromCategory;
module.exports.listFromCategoryAndRoundNumber = listFromCategoryAndRoundNumber;
module.exports.get = get;
module.exports.getFromPlayerAndRound = getFromPlayerAndRound;
module.exports.update = update;
module.exports.remove = remove;
module.exports.removeByRound = removeByRound;
module.exports.removeByTournament = removeByTournament;

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

async function listFromRoundNumber(e, tournament_uuid, round_number) {
  try {
    let round_request = await RoundsController.getByNumber(null,tournament_uuid,round_number);
    if(round_request.ok === 1){
      let round_uuid = round_request.round.uuid;

      return await listFromRound(null,tournament_uuid,round_uuid);
    }

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
        ["category_place","ASC"]
      ],
      include: [
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
    return { ok: 1, error: 0, standings: await StandingDTO.convertToExportList(standings) };
  } catch (error) {
      console.log(error);
  }
}
async function listFromCategoryAndRoundNumber(e, tournament_uuid, category_uuid, round_number) {
  try {
    let round_request = await RoundsController.getByNumber(null, tournament_uuid, round_number);
    if (round_request.ok === 1) {
      let round_uuid = round_request.round.uuid;

      return await listFromCategory(null, tournament_uuid, category_uuid, round_uuid);
    }

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
      await Standings.destroy({
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
    await Standings.destroy({
      where: {
        roundUuid: round_uuid
      }
    });
    return { ok: 1, error: 0 };

  } catch (error) {
    console.log(error);
  }
}
async function removeByTournament(e, tournament_uuid) {
  try {
    await Standings.destroy({
      where: {
        tournamentUuid: tournament_uuid
      }
    });
    return { ok: 1, error: 0 };

  } catch (error) {
    console.log(error);
  }
}

async function generateReport(e, tournament_uuid, round_number, category_uuid) {
  try {
    let tournament_request = await TournamentsController.get(null, tournament_uuid);
    if (tournament_request.ok === 1) {
      let round_request = await RoundsController.getByNumber(null, tournament_uuid, round_number);
      if (round_request.ok === 1) {
        let round = round_request.round;

        // Path when running electron executable
        let pathIndex = '../../index.html';

        if (fs.existsSync(path.join(__dirname, '../../dist/index.html'))) {
          // Path when running electron in local folder
          pathIndex = '../../dist/index.html';
        }

        const url = new URL(path.join('file:', __dirname, pathIndex));

        console.log(url);
        console.log(url.href.concat("?elec_route=print/tournament/".concat(tournament_uuid).concat("/standings/").concat(round.uuid).concat("/").concat(category_uuid)));

        await window_pdf.loadURL(url.href.concat("?elec_route=print/tournament/".concat(tournament_uuid).concat("/standings/").concat(round.uuid).concat("/").concat(category_uuid))); //give the file link you want to display


        setTimeout(() => {
          let window_show_pdf = pdf_window_func();

          const pdf_url = new URL(path.join('file:', __dirname, "../../app/__temp_reports/report.pdf"));
          window_show_pdf.loadURL(pdf_url.href)

        }, 1000);
        return { ok: 1, error: 0 };
      }else{
        return round_request;
      }
    }else{
      return tournament_request;
    }
  } catch (error) {
    console.log(error);
  }
  return { ok: 0, error: 1, message: "Erro ainda desconhecido" };
}
