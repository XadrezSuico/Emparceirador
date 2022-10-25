const database = require('../db/db');
const Pairings = require('../models/pairing.model');

const PlayersController = require('./player.controller');
const RoundsController = require('./round.controller');

const PlayerDTO = require('../dto/player.dto');
const PairingDTO = require('../dto/pairing.dto');

const dateHelper = require("../helpers/date.helper");
const orderingHelper = require("../helpers/ordering.helper");
const Tournaments = require('../models/tournament.model');
const Rounds = require('../models/round.model');
const Players = require('../models/player.model');
const { Op } = require('sequelize');
const Standings = require('../models/standing.model');

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('controller.pairings.listAll', listAll)
  ipcMain.handle('controller.pairings.listByRound', listFromRound)
  ipcMain.handle('controller.pairings.create', create)
  ipcMain.handle('controller.pairings.get', get)
  ipcMain.handle('controller.pairings.update', update)
  ipcMain.handle('controller.pairings.remove', remove)
  ipcMain.handle('controller.pairings.removeByRound', removeByRound)
  ipcMain.handle('controller.pairings.isAllPairingsWithResult', isAllPairingsWithResult)
}

module.exports.listAll = listAll;
module.exports.listByRound = listFromRound;
module.exports.listFromRound = listFromRound;
module.exports.create = create;
module.exports.get = get;
module.exports.update = update;
module.exports.remove = remove;
module.exports.removeByRound = removeByRound;
module.exports.isAllPairingsWithResult = isAllPairingsWithResult;
module.exports.listPlayerPairings = listPlayerPairings;
module.exports.hasPlayersPlayed = hasPlayersPlayed;

async function create(event, round_uuid, pairing){
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
        resultadoCreate = await Pairings.create({
          number: pairing.number,
          player_a_uuid: pairing.player_a_uuid,
          player_a_result: 1,
          player_b_result: 0,
          is_bye: true,

          roundUuid: round_uuid,
        })
      }
      // console.log(resultadoCreate);
      return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
    } catch (error) {
        console.log(error);
    }
}

async function listAll() {
  try {
    let pairings = await Pairings.findAll();
    let pairings_return = [];
    let i = 0;
    for(let pair of pairings){
      let pairing_return = {
        uuid: pair.uuid,
        number: pairing.number,
        player_a_uuid: pair.player_a_uuid,
        player_a_result: pair.player_a_result,
        player_a_wo: pair.player_a_wo,
        player_b_uuid: pair.player_b_uuid,
        player_b_result: pair.player_b_result,
        player_b_wo: pair.player_b_wo,
        have_result: pairing.have_result,
        is_bye: pair.is_bye,
      };

      pairings_return[i++] = pairing_return;
    }
    return {ok:1,error:0,pairings:pairings_return};
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
          include:[
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


        let pairings_return = [];
        let i = 0;

        // console.log("Pairings by Round")
        // console.log(pairings)

        for(let pairing of pairings){

          // console.log(pairing);

          let pairing_return = {
            uuid: pairing.uuid,
            number: pairing.number,
            player_a: await PlayerDTO.convertToExport(pairing.player_a),
            player_a_uuid: pairing.player_a_uuid,
            player_a_result: pairing.player_a_result,
            player_a_wo: pairing.player_a_wo,
            player_b: await PlayerDTO.convertToExport(pairing.player_b),
            player_b_uuid: pairing.player_b_uuid,
            player_b_result: pairing.player_b_result,
            player_b_wo: pairing.player_b_wo,
            have_result: pairing.have_result,
            is_bye: pairing.is_bye,
          };

          pairings_return[i++] = pairing_return;
        }
        return {ok:1,error:0,pairings:pairings_return};
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

    let pairing_return = {
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
        round_uuid: pairing.roundUuid,
    };

    return {ok:1,error:0,pairing:pairing_return};
  } catch (error) {
      console.log(error);
  }
}

async function update(e,pairing){
  try {
      let resultado = await Pairings.update({
        number: pairing.number,
        player_a_uuid: pairing.player_a_uuid,
        player_a_result: pairing.player_a_result,
        player_a_wo: pairing.player_a_wo,
        player_b_uuid: pairing.player_b_uuid,
        player_b_result: pairing.player_b_result,
        player_b_wo: pairing.player_b_wo,
        have_result: pairing.have_result,
        is_bye: pairing.is_bye,
      },{
        where:{
          uuid:pairing.uuid
        }
      })

      let pairing_request = await get(null,pairing.uuid);
      if (pairing_request.ok === 1) {
        await RoundsController.updateStandings(null,pairing_request.pairing.round_uuid);
      }
      // console.log(resultado);
      return {ok:1,error:0};
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
    Pairings.destroy({
      where: {
        roundUuid: round_uuid
      }
    });
    return { ok: 1, error: 0 };

  } catch (error) {
    console.log(error);
  }
}


async function removeByRound(e, round_uuid) {
  try {
    Pairings.destroy({
      where: {
        roundUuid: round_uuid
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
          "pairing": pairing
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
          "place":"b",
          "pairing": pairing
        };
        // console.log("Player Pairing B(".concat(pairing.player_b.uuid).concat("): ").concat(String(pairing.player_b_result)));

        player_pairings[pairing.round.number] = player_pairing;
      }
    }

    // console.log("Pairings Temporary Points(".concat(player_uuid).concat("): ").concat(String(points)));
    // console.log(player_pairings);

    return {ok:1,error:0,points:points,player_pairings:player_pairings};
  } catch (error) {
      console.log(error);
  }
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
      return { ok: 1, error: 0, result: true, pairing: PairingDTO.convertToExport(pairing) };
    }

    return { ok: 1, error: 0, result: false };
  } catch (error) {
    console.log(error);
  }
}
