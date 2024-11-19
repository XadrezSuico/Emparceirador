const database = require('../db/db');
const Rounds = require('../models/round.model');
const { ipcMain } = require('electron');
const { uuid } = require('uuidv4');

const PlayersController = require('../controllers/player.controller');
const PairingsController = require('../controllers/pairing.controller');
const TournamentsController = require('../controllers/tournament.controller');
const StandingsController = require('../controllers/standing.controller');
const TiebreaksController = require('../controllers/tiebreak.controller');

const dateHelper = require("../helpers/date.helper");
const pairingHelper = require("../helpers/pairing.helper");
const RoundDTO = require("../dto/round.dto");
const { last } = require('rxjs');
const Tournaments = require('../models/tournament.model');
const Categories = require('../models/category.basic.model');

const pairsCalc = require('robin-js'); // CJS

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('controller.rounds.listAll', listAll)
  ipcMain.handle('controller.rounds.listFromTournament', listFromTournament)
  ipcMain.handle('controller.rounds.create', create)
  ipcMain.handle('controller.rounds.get', get)
  ipcMain.handle('controller.rounds.update', update)
  ipcMain.handle('controller.rounds.getLastRound', getLastRound)
  ipcMain.handle('controller.rounds.getByNumber', getByNumber)
  ipcMain.handle('controller.rounds.generateRound', generateRound)
  ipcMain.handle('controller.rounds.canGenerateNewRound', canGenerateNewRound)
  ipcMain.handle('controller.rounds.unPairRound', unPairRound)
  ipcMain.handle('controller.rounds.updateStandings', updateStandings)
  ipcMain.handle('controller.rounds.updateStandingsFromTournament', updateStandingsFromTournament)

  ipcMain.addListener("controller.rounds.need_export", need_export);
}

module.exports.listAll = listAll;
module.exports.listFromTournament = listFromTournament;
module.exports.listByTournament = listFromTournament;
module.exports.create = create;
module.exports.import = Import;
module.exports.get = get;
module.exports.update = update;
module.exports.getLastRound = getLastRound;
module.exports.getByNumber = getByNumber;
module.exports.generateRound = generateRound;
module.exports.canGenerateNewRound = canGenerateNewRound;
module.exports.updateStandings = updateStandings;
module.exports.remove = remove;


async function need_export(rounds_uuid) {
  let round_request = await get(null, rounds_uuid);
  if (round_request.ok === 1) {
    ipcMain.emit("controller.tournaments.need_export", round_request.round.tournament_uuid);
  }
}
async function create(event, tournament_uuid, round){
  try {
      let resultadoCreate = await Rounds.create({
        number: round.number,
        tournamentUuid: tournament_uuid
      })
      // console.log(resultadoCreate);
      return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
    } catch (error) {
        console.log(error);
    }
}
async function Import(event, tournament_uuid, round) {
  try {
    let resultadoCreate = await Rounds.create({
      uuid: (round.uuid) ? round.uuid : uuid(),
      number: round.number,
      tournamentUuid: tournament_uuid
    })
    // console.log(resultadoCreate);
    return { ok: 1, error: 0, data: { uuid: resultadoCreate.uuid } };
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
        tournament_uuid: round.tournamentUuid,
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
        tournament_uuid: round.tournamentUuid,
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
    let round = await Rounds.findOne({
      where:{
        uuid: uuid
      },
      include:[
        {
          model: Tournaments,
          as: 'tournament',
          include:[
            {
              model: Categories,
              as: 'categories'
            }
          ]
        },
      ]
    });

    if(round){
      return { ok: 1, error: 0, round: await RoundDTO.convertToExport(round) };
    }

    return { ok: 0, error: 1, message: "Rodada não encontrada" }
    // console.log(round);

  } catch (error) {
      console.log(error);
  }
}

async function getByNumber(e,tournament_uuid,number) {
  try {
    let round = await Rounds.findOne({
      where: {
        tournamentUuid:tournament_uuid,
        number:number
      }
    });

    if(round){
      let round_return = {
        uuid: round.uuid,
        number: round.number,
        tournament_uuid: round.tournamentUuid,
      };

      return {ok:1,error:0,round:round_return};
    }
    return {ok:0,error:1,message:"Rodada não encontrada"}
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
    // console.log(resultado);
      need_export(round.uuid);
      return {ok:1,error:0};
    } catch (error) {
        console.log(error);
    }

}

async function remove(e, uuid) {
  try {
    let round = await Rounds.findByPk(uuid);

    if (round) {
      await Rounds.destroy({
        where: {
          uuid: uuid
        }
      });
      return { ok: 1, error: 0 };
    } else {
      return { ok: 0, error: 1, message: "Rodada não encontrada" };
    }

  } catch (error) {
    console.log(error);
  }
}
async function removeByTournament(e, tournament_uuid) {
  try {
    await Rounds.destroy({
      where: {
        tournamentUuid: tournament_uuid
      }
    });
    return { ok: 1, error: 0 };

  } catch (error) {
    console.log(error);
  }
}


async function getLastRound(e,tournament_uuid) {
  try {
    // console.log("getLastRound")
    let round = await Rounds.findOne({
      where: {
        tournamentUuid: tournament_uuid
      },
      order:[
        ["number","DESC"],
      ],
      include:[
        {
          model: Tournaments,
          as: "tournament"
        }
      ]
    });

    if (round){
      // console.log(round)
      // console.log("-")
      // console.log(await RoundDTO.convertToExport(round))

      return { ok: 1, error: 0, round: await RoundDTO.convertToExport(round) };
    }else{
      return { ok: 0, error: 1, message: "Rodada não encontrada -" };
    }
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

    // console.log("Count: ".concat(String(count)));

    return {ok:1,error:0,count:count};
  } catch (error) {
      console.log(error);
  }
}

async function generateRound(e,tournament_uuid){
  // console.log("generateRound");
  let retorno_tournament = await TournamentsController.get(e,tournament_uuid);
  if(retorno_tournament.ok === 1){
    let tournament = retorno_tournament.tournament;

    let retorno_players = await PlayersController.listFromTournament(e,tournament_uuid);
    if(retorno_players.ok === 1){
      if(retorno_players.players.length > 1){
        switch(tournament.tournament_type){
          case "SWISS":
            return await generateRoundSwiss(tournament);
          case "SCHURING":
            return await generateSchuringTournament(tournament);
        }
      }
    }
  }
}

async function unPairRound(e, tournament_uuid, round_number) {
  // console.log("unPairRound");
  let retorno_tournament = await TournamentsController.get(e, tournament_uuid);
  if (retorno_tournament.ok === 1) {
    let tournament = retorno_tournament.tournament;

    if(tournament.tournament_type === "SWISS"){
      let last_round_request = await getLastRound(null, tournament_uuid);
      if (last_round_request.ok === 1) {
        if (last_round_request.round.number === round_number) {
          await StandingsController.removeByRound(null, last_round_request.round.uuid);
          await PairingsController.removeByRound(null, last_round_request.round.uuid);
          await remove(null, last_round_request.round.uuid);


          ipcMain.emit("controller.tournaments.need_export", last_round_request.round.tournament_uuid);

          return { ok: 1, error: 0 }
        } else {
          return { ok: 0, error: 1, message: "Não é possível desemparceirar essa rodada. A rodada de número ".concat(String(round_number)).concat(" não é a mais recente.") }
        }
      } else {
        return { ok: 0, error: 1, message: last_round_request.message };
      }
    }else{
      let remove_standings_from_tournament_request = await StandingsController.removeByTournament(null,tournament.uuid);
      if (remove_standings_from_tournament_request.ok === 1) {
        let rounds_request = await listFromTournament(null,tournament.uuid);
        if(rounds_request.ok === 1){
          let rounds_uuid = [];
          for(let round of rounds_request.rounds){
            rounds_uuid[rounds_uuid.length] = round.uuid;
          }

          let remove_pairings_from_rounds_request = await PairingsController.removeByRounds(null, rounds_uuid);
          if (remove_pairings_from_rounds_request.ok === 1) {

            let remove_rounds_from_tournament_request = await removeByTournament(null, tournament.uuid);
            if (remove_rounds_from_tournament_request.ok === 1) {


              ipcMain.emit("controller.tournaments.need_export", tournament.uuid);
              return { ok: 1, error: 0 }
            }

          }
        }
      }
      return { ok: 0, error: 1, message: "Erro ainda desconhecido" };
    }

  }else{
    return { ok: 0, error: 1, message: "Torneio não encontrado"};
  }
}

async function generateRoundSwiss(tournament){
  // console.log("generateRoundSwiss");
  let rounds_count = await getRoundsCount(null,tournament.uuid);
  if(rounds_count.ok === 1){
    if(rounds_count.count > 0){
      // console.log("Rounds count: ".concat(rounds_count.count))
      // console.log(tournament);
      let last_round = await getLastRound(null,tournament.uuid);

      await updateStandings(null,last_round.round.uuid);

      // console.log(last_round)

      if(last_round.ok === 1){
        if(tournament.rounds_number > last_round.round.number){
          return generateAnotherRoundSwiss(tournament, last_round);
        }else{
          return {ok:0,error:1,message:"O torneio conforme configuração não permite novas rodadas."};
        }
      }else{
        return {ok:0,error:1,message:"Houve um problema na requisição de geração de nova rodada."};
      }
    }else{
      return generateFirstRoundSwiss(tournament);
    }
  }
  return {ok:0,error:1,message:"Erro desconhecido"};
}

async function generateFirstRoundSwiss(tournament){
  // console.log("generateFirstRoundSwiss");
  let pairings = [];
  let outs = [];
  let players = [];

  let retorno_players = await PlayersController.listFromTournament(null, tournament.uuid, tournament.ordering_sequence);
  if(retorno_players.ok === 1){

    for (let player of retorno_players.players) {
      console.log(player.name);
      await new Promise((res, rej) => {
        console.log(player.rounds_out);
        if (player.rounds_out[1]) {
          if (!player.rounds_out[1].status) {
            console.log(player.rounds_out[1]);
            outs[outs.length] = player;
          } else {
            players[players.length] = player;
          }
        } else {
          players[players.length] = player;
        }
        res(true);
      })
    }

    console.log("players: ")
    console.log(players)
    console.log("outs: ")
    console.log(outs)



    // console.log("retorno_players");
    let total_players = players.length;

    let list_one_count = 0;
    let list_two_count = 0;
    if(total_players % 2 === 0){
      list_one_count = total_players/2;
      list_two_count = total_players/2;
    }else{
      list_two_count = (total_players+1)/2;
      list_one_count = total_players - list_two_count;
    }

    let list_one = [];
    let list_two = [];

    let i = 1;
    let j = 1;
    for(let player of players){
      if(i <= list_one_count){
        list_one[j++] = player;
        if(i === list_one_count){
          j = 1;
        }
        i++;
      }else{
        list_two[j++] = player;
        i++;
      }
    }

    let l = 0;
    for(let k = 1; k <= list_one_count; k++){
      let pairing = [];
      if(k % 2 === 1){
        pairing[0] = list_one[k];
        pairing[1] = list_two[k];
      }else{
        pairing[0] = list_two[k];
        pairing[1] = list_one[k];
      }
      pairings[l++] = pairing;
    }

    if(list_one_count < list_two_count){
      pairings[l++] = [list_two[list_one_count + 1],null];
    }

    for(let out of outs){
      pairings[l++] = [out, null, true]
    }

    return saveSwissPairings(tournament,1,pairings);
  }
}


// async function generateAnotherRoundSwiss(tournament){
//   try{
//     // console.log("generateAnotherRoundSwiss");
//     let pairings = [];

//     let retorno_groups_lists = await PlayersController.listFromTournamentByPoints(null, tournament.uuid, tournament.ordering_sequence);

//     if(retorno_groups_lists.ok === 1){
//       let retorno_last_round = await getLastRound(null,tournament.uuid);
//       if(retorno_last_round.ok === 1){

//         let group_lists = retorno_groups_lists.group_points;

//         let possible_results = await pairingHelper.getAllResultsPossible(retorno_last_round.round.number);

//         // console.log(possible_results);

//         let l = 0;
//         for(let psi = 0; psi < possible_results.length; psi++){
//           let possible_result = possible_results[psi];
//           // console.log("Results: ".concat(String(possible_result)));
//           if(group_lists[possible_result]){
//             if(possible_result === -1){
//               for (let player_not_pairing of group_lists[-1]){
//                 pairings[l++] = [player_not_pairing, null, true];
//               }
//             }else{
//               // console.log("Players: ");
//               // console.log(group_lists[possible_result]);
//               let players = group_lists[possible_result];
//               let total_players = players.length;

//               let list_one_count = 0;
//               let list_two_count = 0;

//               let list_one = [];
//               let list_two = [];

//               if(total_players % 2 === 0){
//                 list_one_count = total_players/2;
//                 list_two_count = total_players/2;
//               }else{
//                 if(possible_result == 0){
//                   list_two_count = (total_players+1)/2;
//                   list_one_count = total_players - list_two_count;
//                 }else{
//                   let found = false;
//                   for(let psi_temp = psi+1; psi_temp < possible_results.length && !found; psi_temp++){
//                     let possible_result_temp = possible_results[psi_temp];
//                     if(group_lists[possible_result_temp]){
//                       players[players.length] = group_lists[possible_result_temp][0];
//                       let temp_group_list = group_lists[possible_result_temp];
//                       // console.log(temp_group_list);
//                       temp_group_list.shift();
//                       // console.log(temp_group_list);
//                       group_lists[possible_result_temp] = temp_group_list;
//                       found = true;
//                     }
//                   }
//                   total_players = players.length;

//                   list_one_count = total_players/2;
//                   list_two_count = total_players/2;
//                 }
//               }


//               let i = 1;
//               let j = 1;
//               for(let player of players){
//                 if(i <= list_one_count){
//                   list_one[j++] = player;
//                   if(i === list_one_count){
//                     j = 1;
//                   }
//                   i++;
//                 }else{
//                   list_two[j++] = player;
//                   i++;
//                 }
//               }

//               for(let k = 1; k <= list_one_count; k++){
//                 let pairing = [];
//                 if(k % 2 === 1){
//                   pairing[0] = list_one[k];
//                   pairing[1] = list_two[k];
//                 }else{
//                   pairing[0] = list_two[k];
//                   pairing[1] = list_one[k];
//                 }
//                 pairings[l++] = pairing;
//               }

//               if(list_one_count < list_two_count){
//                 pairings[l++] = [list_two[list_one_count + 1],null];
//               }
//             }

//           }
//         }

//         return saveSwissPairings(tournament,retorno_last_round.round.number + 1,pairings);
//       }
//     }

//     return {ok:1};
//   }catch(error){
//     console.log(error);
//   }
//   return { ok: 0, error: 1, message: "Erro ainda desconhecido" };
// }
/**
 * Gera uma nova rodada de emparceiramento suíço para um torneio.
 *
 * @param {Object} tournament Dados do torneio.
 * @returns {Object} Resultado da operação.
 */
// async function generateAnotherRoundSwiss(tournament) {
//   try {
//     let retorno_last_round = await getLastRound(null, tournament.uuid);
//     if (retorno_last_round.ok === 1) {
//       let round_number = retorno_last_round.round.number + 1;

//       // Buscar os jogadores do torneio ordenados por pontos
//       const playersData = await PlayersController.listFromTournament(null, tournament.uuid, ['points', 'DESC']);

//       if (playersData.ok !== 1) {
//         return { ok: 0, error: 1, message: "Erro ao buscar jogadores para emparceiramento suíço." };
//       }

//       const { players } = playersData;
//       const pairings = [];
//       const outs = players.filter(player => player.rounds_out[round_number] && !player.rounds_out[round_number].status);
//       let availablePlayers = players.filter(player => !outs.includes(player));

//       console.log(availablePlayers);

//       // Excluir jogadores que já foram emparceirados nesta rodada
//       // availablePlayers = await excludeAlreadyPairedPlayers(availablePlayers, round_number);

//       if (availablePlayers.length === 0) {
//         return { ok: 0, error: 1, message: "Nenhum jogador disponível para emparceiramento." };
//       }

//       // Caso o número de jogadores seja ímpar, selecionar um jogador para o "bye"
//       let byePlayer = null;
//       if (availablePlayers.length % 2 !== 0) {
//         console.log("hasBye");
//         console.log(availablePlayers);
//         byePlayer = await selectByePlayer(availablePlayers, tournament.uuid);

//         console.log(byePlayer);

//         // Remover o jogador que recebeu o "bye" da lista de jogadores disponíveis
//         availablePlayers = availablePlayers.filter(player => player.uuid !== byePlayer.uuid);
//       }else{
//         console.log("doesntHaveBye");
//       }

//       // Gerar emparceiramentos
//       while (availablePlayers.length > 1) {
//         console.log("availablePlayers.length > 1");
//         const playerA = availablePlayers[0];
//         const possibleOpponents = availablePlayers.slice(1).filter(opponent => !hasPlayedBefore(playerA, opponent, tournament, round_number));

//         if (possibleOpponents.length === 0) {
//           possibleOpponents.push(availablePlayers[1]);
//         }

//         const playerB = possibleOpponents[0];
//         pairings.push([playerA, playerB]);

//         availablePlayers = availablePlayers.filter(player => player.uuid !== playerA.uuid && player.uuid !== playerB.uuid);
//       }

//       if (byePlayer) {
//         pairings.push([byePlayer, null]);
//       }

//       // Emitir os emparceiramentos gerados
//       return saveSwissPairings(tournament, round_number, pairings);
//     }
//     return { ok: 0, error: 1, message: "Erro ainda desconhecido" };
//   } catch (error) {
//     console.error("Erro ao gerar emparceiramentos suíços:", error);
//     return { ok: 0, error: 1, message: "Erro ao gerar emparceiramentos suíços." };
//   }
// }

async function generateAnotherRoundSwiss(tournament, last_round, is_final = false) {
  let players = await PlayersController.listFromTournament(tournament.eventUuid, tournament.uuid);

  if(players.error){
    return { ok: 0, error: 1, message: players.message };
  }

  let players_to_send = [];
  let players_out = []

  let scores = []

  for (let player of players.players) {
    console.log("player");
    console.log(player);
    let player_in = true;
    if (player.rounds_out[last_round.round.number + 1]) {
      if (!player.rounds_out[last_round.round.number + 1].status) {
        console.log("player out");
        players_out[players_out.length] = player
        player_in = false;
      }
    }
    if (player_in){
      console.log("player in");
      let player_to_send = {
        id: player.start_number,
        player: player,
        score: 0,
        pairedUpDown: true,
        receivedBye: false,
        avoid: [],
        colors: []
      }

      let pairings = await PairingsController.listPlayerPairings(tournament.eventUuid, tournament.uuid, player.uuid)

      if (pairings.error) {
        return { ok: 0, error: 1, message: pairings.message };
      }

      // Set the points
      player_to_send.score = pairings.points*2;

      if (!scores.includes(player_to_send.score)){
        scores[scores.length] = player_to_send.score;
      }

      let colors = [];
      console.log("pairings");
      console.log(pairings);
      for (let pairing of pairings.player_pairings){
        if(pairing){
          console.log("pairing");
          console.log(pairing);
          if (!pairing.pairing.is_bye) {
            console.log("place");
            console.log(pairing.place);
            if (pairing.place === "a") {
              player_to_send.avoid[player_to_send.avoid.length] = pairing.pairing.player_b.start_number;

              colors[colors.length] = "w";
            } else {
              player_to_send.avoid[player_to_send.avoid.length] = pairing.pairing.player_a.start_number;

              colors[colors.length] = "b";
            }
          } else {
            player_to_send.receivedBye = true;
          }
        }
      }

      // if(colors[colors.length - 1] === colors[colors.length - 2] && !is_final){
      //   if (colors[colors.length - 1] == "w"){
      //     player_to_send.colors[player_to_send.colors.length] = "b";
      //   }else{
      //     player_to_send.colors[player_to_send.colors.length] = "w";
      //   }
      // }else{
      //   player_to_send.colors = ["w","b"];
      // }

      player_to_send.colors = colors

      players_to_send[players_to_send.length] = player_to_send

    }
  }

  if (players_to_send.length === 0) {
    return { ok: 0, error: 1, message: "Erro ainda desconhecido" };
  }

  scores.sort();

  for(let i = 0; i < players_to_send.length; i++){
    let player = players_to_send[i];

    let index = scores.indexOf(player.score);

    if(index){
      let last_index = 0;
      let next_index = scores.length - 1;

      if (index > 0) {
        last_index = index - 1;
      }
      if (index < scores.length - 1) {
        next_index = index + 1;
      }

      let able_scores = [
        scores[last_index],
        scores[index],
        scores[next_index],
      ]

      for(let player_to_send of players_to_send){
        if(player_to_send.id != player.id){
          if (!able_scores.includes(player_to_send.score)){
            if (!player.avoid.includes(player_to_send.id)){
              player.avoid[player.avoid.length] = player_to_send.id
            }
          }
        }
      }
    }

    players_to_send[i] = player;
  }

  let { Swiss } = await import('tournament-pairings');

  console.log("players_to_send")
  console.log(players_to_send)

  let swiss_return = Swiss(players_to_send, last_round.round.number+1, false, true);



  console.log("swiss_return");
  console.log(swiss_return);

  // return { ok: 0, error: 1, message: "Erro ainda desconhecidoooo" };

  if(swiss_return.length === 0){
    return { ok: 0, error: 1, message: "Erro ainda desconhecidoooo" };
  }

  let group_pairings = [];
  for(let pairing_generated of swiss_return){
    let round_pairing = [null,null]

    let points = 0;
    for(let player_to_send of players_to_send){
      if (player_to_send.id === pairing_generated.player1){
        round_pairing[0] = player_to_send.player;
        points = points + player_to_send.score;
      } else if (player_to_send.id === pairing_generated.player2) {
        round_pairing[1] = player_to_send.player;
        points = points + player_to_send.score;
      }
    }

    // points = points*2

    if(!group_pairings[points]){
      group_pairings[points] = []
    }

    group_pairings[points][group_pairings[points].length] = round_pairing;
  }
  console.log("group_pairings");
  console.log(group_pairings);
  console.log("scores");
  console.log(scores);
  console.log("scores");
  console.log(scores.sort());
  console.log("scores");
  console.log(scores);




  let round_pairings = [];

  for(let group_pairing of group_pairings){
    if (group_pairing){
      for(let pairing of group_pairing){
        round_pairings[round_pairings.length] = pairing
      }
    }
  }

  round_pairings = round_pairings.reverse()

  for(let pairing_out of players_out){
    console.log("pairing out")
    let round_pairing = [pairing_out,null,true];

    round_pairings[round_pairings.length] = round_pairing;
  }

  // console.log("round_pairings")
  // console.log(round_pairings)


  // console.log("generateAnotherRoundSwiss - players");
  // console.log(players);

  return saveSwissPairings(tournament, last_round.round.number+1, round_pairings);
}

/**
 * Seleciona um jogador elegível para receber o "bye" que ainda não o tenha recebido antes.
 *
 * @param {Array} availablePlayers Lista de jogadores disponíveis.
 * @param {UUID} tournamentUuid UUID do torneio.
 * @returns {Object} Jogador selecionado para o "bye".
 */
async function selectByePlayer(availablePlayers, tournamentUuid) {
  for (let i = availablePlayers.length - 1; i >= 0; i--) {
    const player = availablePlayers[i];

    const previousBye = await Pairings.findOne({
      where: {
        player_a_uuid: player.uuid,
        is_bye: true,
        tournament_uuid: tournamentUuid
      }
    });

    // Seleciona o primeiro jogador que ainda não recebeu um "bye"
    if (!previousBye) {
      return player;
    }
  }

  return null; // Retorna null caso todos os jogadores já tenham recebido um "bye"
}


/**
 * Exclui jogadores que já foram emparceirados nesta rodada.
 *
 * @param {Array} players Lista de jogadores disponíveis.
 * @param {Number} round_number Número da rodada atual.
 * @returns {Array} Lista de jogadores que ainda não foram emparceirados.
 */
async function excludeAlreadyPairedPlayers(players) {
  const pairedPlayers = [];

  // Verificar se os jogadores já jogaram entre si em rodadas anteriores
  for (const player of players) {
    // const hasPairings = await PairingsController.checkPairingExistsForPlayer(player.uuid, round_uuid);
    // if (hasPairings) {
      pairedPlayers.push(player);
    // }
  }

  return players.filter(player => !pairedPlayers.includes(player));
}

/**
 * Verifica se dois jogadores já jogaram entre si.
 *
 * @param {Object} playerA Jogador A.
 * @param {Object} playerB Jogador B.
 * @param {Number} round_number Número da rodada atual.
 * @returns {Boolean} Verdadeiro se os jogadores já jogaram entre si.
 */
async function hasPlayedBefore(playerA, playerB, tournament, round_number) {
  const previousPairings = await PairingsController.getPairingsBetweenPlayers(playerA.uuid, playerB.uuid, tournament.uuid);

  if(previousPairings) return previousPairings.some(pairing => pairing.round_number < round_number);

  return false;
}

/**
 * Seleciona o jogador que receberá o "bye" (folga).
 *
 * @param {Array} availablePlayers Lista de jogadores disponíveis.
 * @returns {Object} Jogador selecionado para o "bye".
 */
function selectByePlayer(availablePlayers) {
  // O jogador com menos pontos e que ainda não recebeu bye nas rodadas anteriores recebe o bye
  return availablePlayers.sort((a, b) => a.points - b.points).find(player => !player.has_bye);
}


async function saveSwissPairings(tournament,number,pairings){
  try{
    // console.log("saveSwissPairings");
    let round_check = await getByNumber(null,tournament.uuid,number);
    if(round_check.ok === 0){
      let round_create = await create(null,tournament.uuid,{number:number});
      if(round_create.ok === 1){
        let round_uuid = round_create.data.uuid;
        let i = 1;
        for(let pairing of pairings){
          let request_pairing;
          if (pairing.length === 3){
            request_pairing = {
              number: i++,
              player_a_uuid: pairing[0].uuid,
              player_b_uuid: null,
              have_result: true,
              player_a_result: (pairing[0].rounds_out[number]) ? ((pairing[0].rounds_out[number].points) ? pairing[0].rounds_out[number].points : 0) : 0,
            };
          }else{
            request_pairing = {
              number: i++,
              player_a_uuid: pairing[0].uuid,
              player_b_uuid: (pairing[1]) ? pairing[1].uuid : null,
            };
          }

          let pairing_create = await PairingsController.create(null,round_uuid,request_pairing);
        }

        await updateStandings(null,round_uuid);
        need_export(round_uuid);
        return {ok:1,error:0,data:{number:number,uuid:round_uuid}};
      }
    }
  }catch(error){
    console.log(error);
  }
  return { ok: 0, error: 1, message: "Erro ainda desconhecido" };
}

async function generateSchuringTournament(tournament){
  // console.log("generateSchuringTournament");
  let players_request = await PlayersController.listFromTournament(null, tournament.uuid, ["START_NUMBER", "ALPHABETICAL"]);
  if(players_request.ok === 1){
    let players = []
    for(let player of players_request.players){
      players[players.length] = player;
    }

    let robinjs_rounds = await pairsCalc(players);

    let round_number = 1;
    for (let robinjs_round of robinjs_rounds){
      let pairings = [];
      let bye_pairing = null;
      for (let robinjs_pairing of robinjs_round) {
        if (robinjs_pairing.length === 1) {
          bye_pairing = [robinjs_pairing[0]];
        }else{
          pairings[pairings.length] = robinjs_pairing;
        }
      }
      if (bye_pairing){
        pairings[pairings.length] = bye_pairing;
      }

      let retorno = await saveSchuringPairings(tournament, round_number, pairings);
      if(retorno.ok === 0){
        return retorno;
      } else if (round_number === robinjs_rounds.length){
        return { ok: 1, error: 0, data: retorno.data };
      }
      round_number++;
    }

  }
}
async function saveSchuringPairings(tournament, number, pairings) {
  let round_check = await getByNumber(null, tournament.uuid, number);
  if (round_check.ok === 0) {
    let round_create = await create(null, tournament.uuid, { number: number });
    if (round_create.ok === 1) {
      let round_uuid = round_create.data.uuid;
      let i = 1;
      for (let pairing of pairings) {
        let request_pairing = {
          number: i++,
          player_a_uuid: pairing[0].uuid,
          player_b_uuid: (pairing[1]) ? pairing[1].uuid : null,
        };

        let pairing_create = await PairingsController.create(null, round_uuid, request_pairing, tournament);
      }

      await updateStandings(null, round_uuid);
      need_export(round_uuid);
      return { ok: 1, error: 0, data: { number: number, uuid: round_uuid } };
    }
  }
  return { ok: 0, error: 1, message: "Erro ainda desconhecido" };
}

async function canGenerateNewRound(e, tournament_uuid){
  let tournament_request = await TournamentsController.get(null,tournament_uuid)
  if(tournament_request.ok === 1){
    let tournament = tournament_request.tournament;
    let get_last_round = await getLastRound(null,tournament_uuid);
    if(get_last_round.ok === 1){
      let last_round = get_last_round.round;
      // console.log(last_round)
      if(tournament.tournament_type === "SWISS"){
        if(tournament.rounds_number === last_round.number){
          return {ok:1,error:0,result:false,message:"Última rodada, não é possível gerar nova rodada"}
        }else{
          let get_is_all_pairings_with_result = await PairingsController.isAllPairingsWithResult(null,last_round.uuid);
          if(get_is_all_pairings_with_result.ok === 1){
            if(get_is_all_pairings_with_result.result){
              return {ok:1,error:0,result:true}
            }else{
              return {ok:1,error:0,result:false,message:get_is_all_pairings_with_result.message}
            }
          }
        }
      }else{
        return { ok: 1, error: 0, result: false, message: "O torneio já foi emparceirado." }
      }
    }else{
      if (tournament.tournament_type === "SCHURING") {
        return { ok: 1, error: 0, result: true }
      }
      return { ok: 0, error: 1, message: get_last_round.message }
    }
  }else{
    return { ok: 0, error: 1, message: tournament_request.message }
  }
  return {ok:0,error:1,message:"Erro inesperado"}
}

async function updateStandingsFromTournament(e, tournament_uuid, from_number, limit_number = null){
  let first_round_request = await getByNumber(null, tournament_uuid, from_number);
  if(first_round_request.ok === 1){
    let update_standings_request = await updateStandings(null,first_round_request.round.uuid, limit_number);
    return { ok: 1, error: 0 };
  }
  return {ok:0,error:1,message:"Não há rodadas"};
}

async function updateStandings(e,round_uuid, limit_number = null){
  if(round_uuid){
    console.log("updateStandings: ".concat(round_uuid))
    let round_request = await get(null,round_uuid);
    if(round_request.ok === 1){
      let round = round_request.round;
      let tournament = round.tournament;

      // console.log(round);

      let remove_by_round_request = await StandingsController.removeByRound(null,round.uuid);
      if(remove_by_round_request.ok === 1){

        let all_players_request = await PlayersController.listByTournament(null,tournament.uuid);
        if(all_players_request.ok === 1){
          for(let player of all_players_request.players){
            // console.log("Part1")
            await generateStandingPoints(null,tournament,round,player);
          }
          // console.log("Part2")
          await generateStandingTiebreaks(null, tournament, round);
          // console.log("Part3")
          await orderPlayersTournament(null, tournament, round);
          await orderPlayersCategories(null, tournament, round);
        }
      }

      if(limit_number){
        if(round.number < limit_number){
          let last_round_request = await getLastRound(null, tournament.uuid);
          if (last_round_request.ok === 1) {
            if (last_round_request.round.uuid !== round.uuid) {
              let next_round_request = await getByNumber(null, tournament.uuid, round.number + 1);
              if (next_round_request.ok === 1) {
                // console.log("Next round: ".concat(next_round_request.round.uuid));
                return await updateStandings(null, next_round_request.round.uuid);
              }
            }
          }
        }
      }else{
        let last_round_request = await getLastRound(null, tournament.uuid);
        if (last_round_request.ok === 1) {
          if (last_round_request.round.uuid !== round.uuid) {
            let next_round_request = await getByNumber(null, tournament.uuid, round.number + 1);
            if (next_round_request.ok === 1) {
              // console.log("Next round: ".concat(next_round_request.round.uuid));
              return await updateStandings(null, next_round_request.round.uuid);
            }
          }
        }
      }
      return {ok:1,error:0};
    }
  }
  return {ok:0,error:1,message:"Rodada não encontrada."}
}

async function generateStandingPoints(e, tournament, round, player) {
  if(tournament && round && player){
    // console.log("generateStandingPoints");
    // console.log(player);
    let standing = {
      round_number: round.number,
      place: 0,
      category_place: 0,
      points: 0,
      tiebreaks: [],
      tournament_uuid: tournament.uuid,
      round_uuid: round.uuid,
      player_uuid: player.uuid,
      category_uuid: player.category_uuid
    };

    // console.log(round);

    let pairings_return = await PairingsController.listPlayerPairings(null, tournament.uuid, player.uuid, round.number);
    // console.log("Player pairings");
    // console.log(pairings_return);
    if (pairings_return.ok === 1) {
      for (let player_pairing of pairings_return.player_pairings) {
        if (player_pairing) {
          if (player_pairing.pairing.have_result) {
            if (player_pairing.place === "a") {
              if (!player_pairing.pairing.player_a_wo) {
                standing.points = standing.points + player_pairing.pairing.player_a_result;
              }
            } else {
              if (!player_pairing.pairing.player_b_wo) {
                standing.points = standing.points + player_pairing.pairing.player_b_result;
              }
            }
          }
        }
      }



      await StandingsController.create(null, standing);
    }
  }
}

async function generateStandingTiebreaks(e, tournament, round) {
  // console.log("generateStandingTiebreaks");
  // console.log("tournament: ".concat(tournament.uuid));
  // console.log("round: ".concat(round.uuid));
  let standings_request = await StandingsController.listFromRound(null, tournament.uuid, round.uuid);
  if (standings_request.ok === 1) {
    let standings = standings_request.standings;
    for (let standing of standings) {
      standing.tiebreaks = await TiebreaksController.generateTiebreaks(standing);
      StandingsController.update(null, standing);
    }
  }

}

async function orderPlayersTournament(e, tournament, round) {
  // console.log("orderPlayersTournament");
  // console.log("tournament: ".concat(tournament.uuid));
  // console.log("round: ".concat(round.uuid));
  let standings_request = await StandingsController.listFromRound(null,tournament.uuid,round.uuid);
  if(standings_request.ok === 1){
    let standings = standings_request.standings;
    // console.log(standings);
    // console.log("sorting");
    standings.sort(sortFunction);
    // console.log(standings);
    let place = 1;
    for(let standing of standings){
      standing.place = place++;
      // console.log("Place: ".concat(String(place-1)));
      // console.log(standing);
      StandingsController.update(null,standing);
    }
  }

}
async function orderPlayersCategories(e, tournament, round) {
  // console.log("orderPlayersCategories");
  // console.log("tournament: ".concat(tournament.uuid));
  // console.log("round: ".concat(round.uuid));
  for (let category of tournament.categories){
    let standings_request = await StandingsController.listFromCategory(null, tournament.uuid, category.uuid, round.uuid);
    if (standings_request.ok === 1) {
      let standings = standings_request.standings;
      // console.log(standings);
      // console.log("standings_request");
      standings.sort(sortFunction);
      // console.log(standings);
      let place = 1;
      for (let standing of standings) {
        // console.log("category_standing");
        standing.category_place = place++;
        // console.log("Place: ".concat(String(place-1)));
        // console.log(standing);
        StandingsController.update(null, standing);
      }
    }
  }
}

function sortFunction(a,b){
  if(a.points > b.points){
    return -1
  }else if(a.points < b.points){
    return 1
  }else{
    if(a.tiebreaks.length === b.tiebreaks.length){
      for(let i = 0; i < a.tiebreaks.length; i++){
        let a_tiebreak = a.tiebreaks[i];
        let b_tiebreak = b.tiebreaks[i];
        if (a_tiebreak.value_order > b_tiebreak.value_order){
          return -1
        } else if(a_tiebreak.value_order < b_tiebreak.value_order){
          return 1
        }
      }
    }
    return 0
  }
}


async function remove(e, uuid) {
  try {
    let event = await Rounds.findByPk(uuid);

    if (event) {
      await Rounds.destroy({ where: { uuid: uuid } });
      return { ok: 1, error: 0 };
    } else {
      return { ok: 0, error: 1, message: "Rodada não encontrada" };
    }

  } catch (error) {
    console.log(error);
  }
}
