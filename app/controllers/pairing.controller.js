const database = require('../db/db');
const fs = require('fs');
const path = require('path');
const Pairings = require('../models/pairing.model');
const { ipcMain } = require('electron');

const PlayersController = require('./player.controller');
const RoundsController = require('./round.controller');
const TournamentsController = require('./tournament.controller');

const PlayerDTO = require('../dto/player.dto');
const PairingDTO = require('../dto/pairing.dto');

const dateHelper = require("../helpers/date.helper");
const orderingHelper = require("../helpers/ordering.helper");
const Tournaments = require('../models/tournament.model');
const Rounds = require('../models/round.model');
const Players = require('../models/player.model');
const { Op } = require('sequelize');
const Standings = require('../models/standing.model');

let pdf_func;

module.exports.setEvents = (ipcMain, generateAndOpenPdf) => {
  database.sync();

  pdf_func = generateAndOpenPdf;

  ipcMain.handle('controller.pairings.listAll', listAll)
  ipcMain.handle('controller.pairings.listByRound', listFromRound)
  ipcMain.handle('controller.pairings.create', create)
  ipcMain.handle('controller.pairings.get', get)
  ipcMain.handle('controller.pairings.update', update)
  ipcMain.handle('controller.pairings.remove', remove)
  ipcMain.handle('controller.pairings.removeByRound', removeByRound)
  ipcMain.handle('controller.pairings.isAllPairingsWithResult', isAllPairingsWithResult)
  ipcMain.handle('controller.pairings.generateReport', generateReport)
}

module.exports.listAll = listAll;
module.exports.listByRound = listFromRound;
module.exports.listFromRound = listFromRound;
module.exports.create = create;
module.exports.import = Import;
module.exports.get = get;
module.exports.update = update;
module.exports.remove = remove;
module.exports.removeByRound = removeByRound;
module.exports.removeByRounds = removeByRounds;
module.exports.isAllPairingsWithResult = isAllPairingsWithResult;
module.exports.listPlayerPairings = listPlayerPairings;
module.exports.hasPlayersPlayed = hasPlayersPlayed;


async function need_export(pairing_uuid) {
  let pairing_request = await get(null, pairing_uuid);
  // console.log(pairing_request);
  if (pairing_request.ok === 1) {
    ipcMain.emit("controller.rounds.need_export", pairing_request.pairing.round_uuid);
  }
}
async function create(event, round_uuid, pairing, tournament = null){
  // console.log("PairingsController.create");
  // console.log(pairing);
  try {
    let resultadoCreate;
      if(pairing.player_b_uuid){
        resultadoCreate = await Pairings.create({
          number: pairing.number,
          player_a_uuid: pairing.player_a_uuid,
          player_b_uuid: pairing.player_b_uuid,

          roundUuid: round_uuid,
        })
      }else{
        if(tournament){
          if (tournament.tournament_type === "SWISS") {
            if (pairing.have_result) {
              console.log("have_result");
              resultadoCreate = await Pairings.create({
                number: pairing.number,
                player_a_uuid: pairing.player_a_uuid,
                player_a_result: pairing.player_a_result,
                player_b_result: 0,
                have_result: true,
                is_bye: true,

                roundUuid: round_uuid,
              })
            }else{
              resultadoCreate = await Pairings.create({
                number: pairing.number,
                player_a_uuid: pairing.player_a_uuid,
                player_a_result: 1,
                player_b_result: 0,
                is_bye: true,
                have_result: true,

                roundUuid: round_uuid,
              })
            }
          }else{
            resultadoCreate = await Pairings.create({
              number: pairing.number,
              player_a_uuid: pairing.player_a_uuid,
              player_a_result: 0,
              player_b_result: 0,
              is_bye: true,
              have_result: true,

              roundUuid: round_uuid,
            })
          }
        } else {
          if (pairing.have_result) {
            console.log("have_result");
            resultadoCreate = await Pairings.create({
              number: pairing.number,
              player_a_uuid: pairing.player_a_uuid,
              player_a_result: pairing.player_a_result,
              player_b_result: 0,
              have_result: true,
              is_bye: true,

              roundUuid: round_uuid,
            })
          } else {
            resultadoCreate = await Pairings.create({
              number: pairing.number,
              player_a_uuid: pairing.player_a_uuid,
              player_a_result: 1,
              player_b_result: 0,
              is_bye: true,
              have_result: true,

              roundUuid: round_uuid,
            })
          }
        }
      }
      // console.log(resultadoCreate);
      return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
    } catch (error) {
        console.log(error);
    }
}
async function Import(event, round_uuid, pairing, tournament = null) {
  // console.log("PairingsController.create");
  // console.log(pairing);
  try {
    let resultadoCreate;
      resultadoCreate = await Pairings.create({
        uuid: pairing.uuid,
        number: pairing.number,
        player_a_uuid: pairing.player_a_uuid,
        player_a_result: pairing.player_a_result,
        player_a_wo: pairing.player_a_wo,
        player_b_uuid: pairing.player_b_uuid,
        player_b_result: pairing.player_b_result,
        player_b_wo: pairing.player_b_wo,
        have_result: pairing.have_result,
        is_bye: pairing.is_bye,

        roundUuid: round_uuid,
      })
    // console.log(resultadoCreate);
    return { ok: 1, error: 0, data: { uuid: resultadoCreate.uuid } };
  } catch (error) {
    console.log(error);
  }
}

async function listAll() {
  try {
    let pairings = await Pairings.findAll({
      include:[
        {
          model: Rounds,
          as: 'round',
          include:[
            {
              model: Tournaments,
              as:'tournament'
            }
          ]
        }
      ]
    });
    return {ok:1,error:0,pairings:await PairingDTO.convertToExportList(pairings)};
  } catch (error) {
      console.log(error);
  }
}

async function listFromRound(event,round_uuid) {
  try {
    let round_request = await RoundsController.get(null,round_uuid);
    if(round_request.ok === 1){

      // let round_update_standings_request = await RoundsController.updateStandings(null,round_request.round.uuid);

      // if(round_update_standings_request.ok === 1){
        let pairings = await Pairings.findAll({
          where: {
            roundUuid: round_uuid
          },
          order:[
            ["number","ASC"]
          ],
          include: [
            {
              model: Players,
              as: 'player_a',
              include: [
                {
                  model: Standings,
                  as: 'standings',
                  order: [
                    ["round_number", "ASC"]
                  ],
                }
              ]
            },
            {
              model: Players,
              as: 'player_b',
              include: [
                {
                  model: Standings,
                  as: 'standings',
                  order:[
                    ["round_number","ASC"]
                  ],
                }
              ]
            },
          ]
        });

        // return { ok: 1, error: 0, pairings: [] };
        return { ok: 1, error: 0, pairings: await PairingDTO.convertToExportList(pairings,round_request.round.tournament.table_start_number)};
      }
    // }
  } catch (error) {
      console.log(error);
  }
  return { ok: 0, error: 1, message:"Erro desconhecido" };
}


async function get(e,uuid) {
  try {
    let pairing = await Pairings.findByPk(uuid);

    if(pairing){
      return { ok: 1, error: 0, pairing: await PairingDTO.convertToExport(pairing) };
    }
    return {ok:0,error:1,message:"Emparceiramento não encontrado"}
  } catch (error) {
      console.log(error);
  }
}

async function update(e,pairing,has_result = false){
  try {
    // console.log(pairing);
    let resultado;
    if (has_result){
      resultado = await Pairings.update({
        player_a_result: pairing.player_a_result,
        player_a_wo: pairing.player_a_wo,
        player_b_result: pairing.player_b_result,
        player_b_wo: pairing.player_b_wo,
        have_result: pairing.have_result,
        is_bye: pairing.is_bye,
      }, {
        where: {
          uuid: pairing.uuid
        }
      })
    }else{
      resultado = await Pairings.update({
        number: pairing.number,
        player_a_uuid: pairing.player_a_uuid,
        player_a_result: pairing.player_a_result,
        player_a_wo: pairing.player_a_wo,
        player_b_uuid: pairing.player_b_uuid,
        player_b_result: pairing.player_b_result,
        player_b_wo: pairing.player_b_wo,
        have_result: pairing.have_result,
        is_bye: pairing.is_bye,
      }, {
        where:{
          uuid:pairing.uuid
        }
      })
    }
    // await RoundsController.updateStandings(null, pairing.round_uuid);
    need_export(pairing.uuid);
    return { ok: 1, error: 0 };

    // console.log(resultado);
  } catch (error) {
    console.log(error);
  }

}

async function remove(e,uuid) {
  try {
    let pairing = await Pairings.findByPk(uuid);

    if(pairing){
      Pairings.destroy({
        where: {
          uuid: uuid
        }
      });
      return {ok:1,error:0};
    }else{
      return {ok:0,error:1,message:"Emparceiramento não encontrado"};
    }

  } catch (error) {
      console.log(error);
  }
}

async function removeByRound(e, round_uuid) {
  try {
    await Pairings.destroy({
      where: {
        roundUuid: round_uuid
      }
    });
    return { ok: 1, error: 0 };

  } catch (error) {
    console.log(error);
  }
}
async function removeByRounds(e, rounds_uuid = []) {
  // console.log("removeByRounds");
  // console.log(rounds_uuid);
  try {
    await Pairings.destroy({
      where: {
        roundUuid: {
          [Op.in]: rounds_uuid
        }
      }
    });
    return { ok: 1, error: 0 };

  } catch (error) {
    console.log(error);
  }
}


async function listPlayerPairings(event,tournament_uuid,player_uuid,limit_round_number = null) {
  try {
    let i = 0;
    let points = 0;
    let player_pairings = [];

    let where_rounds = {tournamentUuid: tournament_uuid}

    if(limit_round_number){
      where_rounds.number = {[Op.lte]:limit_round_number};
    }

    let pairings_a = await Pairings.findAll({
      where: {
        player_a_uuid: player_uuid
      },
      include:[
        {
          model: Rounds,
          as: 'round',
          required: true,
          where: where_rounds
        },
        {
          model: Players,
          as: 'player_a'
        }
      ],
      order:[
        ["number","ASC"]
      ]
    });
    for(let pairing of pairings_a){
      if(!pairing.is_wo_a){
        points = points + pairing.player_a_result;

        let player_pairing = {
          "place":"a",
          "pairing": await PairingDTO.convertToExport(pairing)
        };
        // console.log("Player Pairing A(".concat(pairing.player_a.uuid).concat("): ").concat(String(pairing.player_a_result)));

        player_pairings[pairing.round.number] = player_pairing;
      }
    }

    let pairings_b = await Pairings.findAll({
      where: {
        player_b_uuid: player_uuid
      },
      include:[
        {
          model: Rounds,
          as: 'round',
          required: true,
          where: where_rounds
        },
        {
          model: Players,
          as: 'player_b'
        }
      ],
      order:[
        ["number","ASC"]
      ]
    });

    for(let pairing of pairings_b){
      if(!pairing.is_wo_b){
        points = points + pairing.player_b_result;

        let player_pairing = {
          "place": "b",
          "pairing": await PairingDTO.convertToExport(pairing)
        };

        player_pairings[pairing.round.number] = player_pairing;
      }
    }

    return {ok:1,error:0,points:points,player_pairings:player_pairings};
  } catch (error) {
      console.log(error);
  }
  return { ok: 0, error: 1, message: "Erro ainda desconhecido" };
}

async function isAllPairingsWithResult(e,round_uuid){
  let list_from_round = await listFromRound(null,round_uuid)
  if(list_from_round.ok === 1){
    for(let pairing of list_from_round.pairings){
      if(!pairing.have_result){
        return {ok:1,error:0,result:false,message:"Rodada possui ainda resultados pendentes"}
      }
    }
    return {ok:1,error:0,result:true}
  }else{
    return {ok:0,error:1,message:"Erro desconhecido"}
  }
}



async function hasPlayersPlayed(e, player_a_uuid,player_b_uuid) {
  // console.log("hasPlayersPlayed");
  // console.log("aUuid: ".concat(player_a_uuid));
  // console.log("bUuid: ".concat(player_b_uuid));
  try {
    let pairing = await Pairings.findOne({
      where:{
        [Op.or]: [
          {
            player_a_uuid: player_a_uuid,
            player_b_uuid: player_b_uuid
          },
          {
            player_a_uuid: player_b_uuid,
            player_b_uuid: player_a_uuid
          },
        ]
      }
    });

    if(pairing){
      return { ok: 1, error: 0, result: true, pairing: await PairingDTO.convertToExport(pairing) };
    }

    return { ok: 1, error: 0, result: false };
  } catch (error) {
    console.log(error);
  }
}

async function generateReport(e, tournament_uuid, round_number) {
  try {
    let tournament_request = await TournamentsController.get(null, tournament_uuid);
    if (tournament_request.ok === 1) {
      let round_request = await RoundsController.getByNumber(null, tournament_uuid, round_number);
      if (round_request.ok === 1) {
        let round = round_request.round;
        await pdf_func("print/tournament/".concat(tournament_uuid).concat("/pairings/").concat(round.uuid));
        return { ok: 1, error: 0 };
      }
    }
  } catch (error) {
    console.log(error);
  }
  return { ok: 0, error: 1, message: "Erro ainda desconhecido" };
}
