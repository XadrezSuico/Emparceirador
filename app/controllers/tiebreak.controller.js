const database = require('../db/db');

const tiebreakHelper = require("../helpers/tiebreak.helper")

const PlayersController = require("../controllers/player.controller")
const PairingsController = require("../controllers/pairing.controller")
const StandingsController = require("../controllers/standing.controller")


module.exports.setEvents = (ipcMain) => {
  ipcMain.handle('controller.tiebreaks.get', get)
  ipcMain.handle('controller.tiebreaks.getSwiss', getSwiss)
  ipcMain.handle('controller.tiebreaks.getFromList', getFromList)
};

module.exports.generateTiebreaks = generateTiebreaks;

function get() {
  let tiebreaks = tiebreakHelper.tiebreaks();

  return { ok: 1, error: 0, tiebreaks: tiebreaks }
}

function getSwiss() {
  let tiebreaks = tiebreakHelper.tiebreaks();

  let swiss_tiebreaks = [];

  for (let tiebreak of tiebreaks) {
    if (tiebreak.is_swiss) {
      swiss_tiebreaks.push(tiebreak);
    }
  }

  return { ok: 1, error: 0, tiebreaks: swiss_tiebreaks }
}

async function getFromList(e,tiebreaks) {
  let return_tiebreaks = [];

  for (let tiebreak of tiebreaks) {
    for (let tiebreak_item of tiebreakHelper.tiebreaks()){
      if(tiebreak_item.id === tiebreak){
        return_tiebreaks[return_tiebreaks.length] = tiebreak_item;
      }
    }
  }
  return { ok: 1, error: 0, tiebreaks: return_tiebreaks }
}


async function generateTiebreaks(standing){
  if (standing){
    let player_tiebreaks = [];
    let order = 0;
    for (let tiebreak of standing.tournament.tiebreaks){
      let player_tiebreak = tiebreakHelper.defaultTiebreakObject();
      switch (tiebreak) {
        case "XZT_001":
          // Direct Encounter
          player_tiebreak.order = order
          player_tiebreak.id = tiebreak
          player_tiebreak.value_order = await generateTiebreakDirectEncounter(standing)
          player_tiebreak.value = String(player_tiebreak.value_order)
          break;
        case "XZT_002":
          // Total Buchholz
          player_tiebreak.order = order
          player_tiebreak.id = tiebreak
          player_tiebreak.value_order = await generateTieBreakBuchholz(standing)
          player_tiebreak.value = String(player_tiebreak.value_order)
          break;
        case "XZT_003":
          // Buchholz without better result
          player_tiebreak.order = order
          player_tiebreak.id = tiebreak
          player_tiebreak.value_order = await generateTieBreakBuchholz(standing,1)
          player_tiebreak.value = String(player_tiebreak.value_order)
          break;
        case "XZT_004":
          // Buchholz without worst result
          player_tiebreak.order = order
          player_tiebreak.id = tiebreak
          player_tiebreak.value_order = await generateTieBreakBuchholz(standing,0,1)
          player_tiebreak.value = String(player_tiebreak.value_order)
          break;
        case "XZT_005":
          // Buchholz without better and worst result
          player_tiebreak.order = order
          player_tiebreak.id = tiebreak
          player_tiebreak.value_order = await generateTieBreakBuchholz(standing, 1, 1)
          player_tiebreak.value = String(player_tiebreak.value_order)
          break;
        case "XZT_006":
          // Sonneborn-Berger
          player_tiebreak.order = order
          player_tiebreak.id = tiebreak
          player_tiebreak.value_order = await generateBerger(standing)
          player_tiebreak.value = String(player_tiebreak.value_order)
          break;
        case "XZT_007":
          // Arranz System
          player_tiebreak.order = order
          player_tiebreak.id = tiebreak
          player_tiebreak.value_order = await generateArranz(standing)
          player_tiebreak.value = String(player_tiebreak.value_order)
          break;
      }

      player_tiebreaks[order++] = player_tiebreak;
    }

    return player_tiebreaks;
  }else{
    return [];
  }
}

async function generateTiebreakDirectEncounter(player_standing){
  let standings = [];

  // Get other standings with same points
  let standing_request = await StandingsController.listFromRound(null,player_standing.tournament.uuid,player_standing.round.uuid);
  if(standing_request.ok === 1){
    let st_c = 0;
    for (let standing of standing_request.standings) {
      if (standing.points === player_standing.points && standing.player.uuid !== player_standing.player.uuid) {
        standings[st_c++] = standing;
      }
    }

    // If don't have other players with same points, this tiebreak doesn't work
    if (standings.length === 0) {
      return -1;
    }

    let points = 0;
    for (standing of standings) {
      let pairing_request = await PairingsController.hasPlayersPlayed(null,player_standing.player.uuid,standing.player.uuid);
      if (pairing_request.ok === 1) {
        console.log(pairing_request);
        if (pairing_request.result) {
          if (!pairing_request.pairing.player_a_wo && !pairing_request.pairing.player_b_wo && !pairing_request.pairing.is_bye){
            if (pairing_request.pairing.player_a_uuid === player_standing.player.uuid) {
              points = points + pairing_request.pairing.player_a_result;
            } else {
              points = points + pairing_request.pairing.player_b_result;
            }
          }
        } else {
          // If one of players selected not played with this player, so this tiebreak doesn't work
          return -2;
        }
      }
    }

    return points;
  }
  return -3;
}

async function generateTieBreakBuchholz(player_standing,better_not_count=0,worst_not_count=0){
  let results = [];
  let results_count = 0;

  let player_pairings = await PairingsController.listPlayerPairings(null,player_standing.tournament.uuid,player_standing.player.uuid,player_standing.round.number);
  if (player_pairings.ok === 1) {
    // console.log(player_pairings);
    for (let player_pairing of player_pairings.player_pairings){
      if (player_pairing){
        let other_player_uuid = "";
        // console.log(player_pairing);
        if (!player_pairing.pairing.player_a_wo && !player_pairing.pairing.player_b_wo && !player_pairing.pairing.is_bye){
          if (player_pairing.place === "a") {
            other_player_uuid = player_pairing.pairing.player_b_uuid;
          } else {
            other_player_uuid = player_pairing.pairing.player_a_uuid;
          }

          let other_player_standing = await StandingsController.getFromPlayerAndRound(null, player_standing.tournament.uuid, player_standing.round.uuid, other_player_uuid);
          if (other_player_standing.ok === 1) {
            results[results_count++] = other_player_standing.standing.points;
          }
        }
      }
    }

    results.sort();

    if (better_not_count > 0) {
      for (let i = 0; i < better_not_count; i++) {
        results.pop();
      }
    }
    if (worst_not_count > 0) {
      for (let i = 0; i < worst_not_count; i++) {
        results.shift();
      }
    }

    let points = 0;
    for(let result of results){
      points = points + result;
    }
    return points;
  }
  return 0;
}

async function generateBerger(player_standing, better_not_count = 0, worst_not_count = 0) {
  // console.log("generateBerger")
  let results = [];
  let results_count = 0;

  let player_pairings = await PairingsController.listPlayerPairings(null, player_standing.tournament.uuid, player_standing.player.uuid, player_standing.round.number);
  // console.log(player_pairings)
  if (player_pairings.ok === 1) {
    for (let player_pairing of player_pairings.player_pairings) {
      if (player_pairing){
        let other_player_uuid = "";
        let player_result = 0;

        if (player_pairing.place === "a") {
          other_player_uuid = player_pairing.pairing.player_b_uuid;
          if (player_pairing.pairing.have_result) {
            player_result = player_pairing.pairing.player_a_result;
          }
        } else {
          other_player_uuid = player_pairing.pairing.player_a_uuid;
          if (player_pairing.pairing.have_result) {
            player_result = player_pairing.pairing.player_b_result;
          }
        }

        let other_player_standing = await StandingsController.getFromPlayerAndRound(null, player_standing.tournament.uuid, player_standing.round.uuid, other_player_uuid);
        if (other_player_standing.ok === 1) {
          results[results_count++] = other_player_standing.standing.points * player_result;
        }
      }
    }

    results.sort();
    // console.log(results)

    if (better_not_count > 0) {
      for (let i = 0; i < better_not_count; i++) {
        results.pop();
      }
    }
    if (worst_not_count > 0) {
      for (let i = 0; i < worst_not_count; i++) {
        results.shift();
      }
    }

    let points = 0.0;
    for (let result of results) {
      points = points + result;
    }
    return points;
  }
  return 0;
}

async function generateArranz(player_standing) {
  let results = [];
  let results_count = 0;

  let player_pairings = await PairingsController.listPlayerPairings(null, player_standing.tournament.uuid, player_standing.player.uuid, player_standing.round.number);
  if (player_pairings.ok === 1) {
    for (let player_pairing of player_pairings.player_pairings) {
      if (player_pairing){
        if (player_pairing.place === "a") {
          if (player_pairing.pairing.have_result) {
            if (player_pairing.pairing.player_a_result === 0.5) {
              results[results_count++] = 0.4;
            } else {
              results[results_count++] = player_pairing.pairing.player_a_result;
            }
          }
        } else {
          if (player_pairing.pairing.have_result) {
            if (player_pairing.pairing.player_b_result === 0.5) {
              results[results_count++] = 0.6;
            } else {
              results[results_count++] = player_pairing.pairing.player_b_result;
            }
          }
        }
      }
    }

    let points = 0.0;
    for (let result of results) {
      points = points + result;
    }
    return points;
  }
  return 0;
}
