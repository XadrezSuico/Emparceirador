const mockApp = { getPath: () => '/home/joao/.config/xadrezsuico-emparceirador' };
require('module').prototype.require = new Proxy(require('module').prototype.require, {
  apply(target, thisArg, argumentsList) {
    if (argumentsList[0] === 'electron') return { app: mockApp, ipcMain: { handle: ()=>{}, addListener: ()=>{}, emit: ()=>{} } };
    return Reflect.apply(target, thisArg, argumentsList);
  }
});

const RoundsController = require('./app/controllers/round.controller.js');
const TournamentsController = require('./app/controllers/tournament.controller.js');
const PairingsController = require('./app/controllers/pairing.controller.js');
const PlayersController = require('./app/controllers/player.controller.js');
const TRFHelper = require('./app/helpers/trf.helper.js');
const database = require('./app/db/db.js');

async function run() {
    await database.sync();
    // Get the first tournament
    let tourns = await TournamentsController.listAll(null);
    if (!tourns.tournaments || tourns.tournaments.length === 0) return console.log("No tournaments");
    let tourn = tourns.tournaments[0];
    
    let roundsReq = await RoundsController.listFromTournament(null, tourn.uuid);
    let rounds = roundsReq.rounds || [];
    
    let playersReq = await PlayersController.listByTournament(null, tourn.uuid);
    let players = playersReq.players || [];
    
    let pairingsReq = await PairingsController.listAll(null);
    let pairings = pairingsReq.pairings || [];
    let roundUuids = rounds.map(r => r.uuid);
    pairings = pairings.filter(p => roundUuids.includes(p.round_uuid));
    
    let trf = TRFHelper.generateTRF(tourn, {}, players, rounds, pairings);
    console.log(trf);
}
run().catch(console.error);
