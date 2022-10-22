const database = require('../db/db');
const Pairings = require('../models/pairing.model');

const dateHelper = require("../helpers/date.helper");
const orderingHelper = require("../helpers/ordering.helper");
const Tournaments = require('../models/tournament.model');

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('model.pairings.listAll', listAll)
  ipcMain.handle('model.pairings.listByRound', listFromRound)
  ipcMain.handle('model.pairings.create', create)
  ipcMain.handle('model.pairings.get', get)
  ipcMain.handle('model.pairings.update', update)
  ipcMain.handle('model.pairings.remove', remove)
  ipcMain.handle('model.pairings.isAllPairingsWithResult', isAllPairingsWithResult)
}

module.exports.listAll = listAll;
module.exports.listByRound = listFromRound;
module.exports.listFromRound = listFromRound;
module.exports.create = create;
module.exports.get = get;
module.exports.update = update;
module.exports.remove = remove;
module.exports.isAllPairingsWithResult = isAllPairingsWithResult;

async function create(event, round_uuid, pairing){
  console.log("PairingsController.create");
  console.log(pairing);
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
      console.log(resultadoCreate);
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
    let pairings = await Pairings.findAll({
      where: {
        roundUuid: round_uuid
      },
      order:[
        ["number","ASC"]
      ]
    });


    let pairings_return = [];
    let i = 0;
    for(let pairing of pairings){

      let pairing_return = {
        uuid: pairing.uuid,
        number: pairing.number,
        player_a_uuid: pairing.player_a_uuid,
        player_a_result: pairing.player_a_result,
        player_a_wo: pairing.player_a_wo,
        player_b_uuid: pairing.player_b_uuid,
        player_b_result: pairing.player_b_result,
        player_b_wo: pairing.player_b_wo,
        is_bye: pairing.is_bye,
      };

      pairings_return[i++] = pairing_return;
    }
    return {ok:1,error:0,pairings:pairings_return};
  } catch (error) {
      console.log(error);
  }
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
        is_bye: pairing.is_bye,
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
        is_bye: pairing.is_bye,
      },{
        where:{
          uuid:pairing.uuid
        }
      })
      console.log(resultado);
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



async function isAllPairingsWithResult(e,round_uuid){
  let list_from_round = await listFromRound(null,round_uuid)
  if(list_from_round.ok === 1){
    for(let pairing of list_from_round.pairings){
      if(!(pairing.player_a_result) && !(pairing.player_b_result)){
        return {ok:1,error:0,result:false,message:"Rodada possui ainda resultados pendentes"}
      }
    }
    return {ok:1,error:0,result:true}
  }else{
    return {ok:0,error:1,message:"Erro desconhecido"}
  }
}
