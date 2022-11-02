const TournamentsController = require("./tournament.controller")
const CategoriesController = require("./category.controller")
const PlayersController = require("./player.controller")
const RoundsController = require("./round.controller")
const StandingsController = require("./standing.controller")
const PairingsController = require("./pairing.controller")

const Events = require('../models/event.model');

module.exports.remove = remove;

async function remove(uuid) {
  try {
    let event = await Events.findByPk(uuid);
    let tournaments_request = await TournamentsController.listFromEvent(null,uuid);
    if(tournaments_request.ok === 1){
      for (let tournament of tournaments_request.tournaments){

        let rounds_request = await RoundsController.listByTournament(null,tournament.uuid);
        if(rounds_request.ok === 1){
          for (let round of rounds_request.rounds) {

            let standings_request = await StandingsController.listFromRound(null, tournament.uuid, round.uuid);
            if (standings_request.ok === 1) {
              for (let standing of standings_request.standings) {
                console.log("standing-d-".concat(standing.uuid));
                await StandingsController.remove(standing.uuid);
              }
            }

            let pairings_request = await PairingsController.listByRound(null, round.uuid);
            if(pairings_request.ok === 1){
              for (let pairing of pairings_request.pairings) {
                console.log("pairing-d-".concat(pairing.uuid));
                await PairingsController.remove(pairing.uuid);
              }
            }
            console.log("round-d-".concat(round.uuid));
            await RoundsController.remove(round.uuid)
          }
        }

        let players_request = await PlayersController.listByTournament(null,tournament.uuid);
        if(players_request.ok === 1){
          for (let player of players_request.players) {
            console.log("player-d-".concat(player.uuid));
            await PlayersController.remove(null,player.uuid,true);
          }
        }

        let categories_request = await CategoriesController.listFromTournament(null,tournament.uuid);
        if(categories_request.ok === 1){
          for (let category of categories_request.categories) {
            console.log("category-d-".concat(category.uuid));
            await CategoriesController.remove(null,category.uuid,true);
          }
        }

        console.log("tournament-d-".concat(tournament.uuid));
        await TournamentsController.remove(null, tournament.uuid);
      }
    }
    await Events.destroy({
      where:{
        uuid: uuid
      }
    });

    return {ok:1,error:0};
  }catch(error){
    console.log(error);
  }
  return { ok: 0, error: 1, message: "Erro ainda desconhecido" };

}
