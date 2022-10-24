const Pairings = require('./pairing.basic.model');
const Rounds = require('./round.basic.model');
const Standings = require('./standing.basic.model');
const Tournaments = require('./tournament.basic.model');

Rounds.belongsTo(Tournaments)

Rounds.hasMany(Pairings)
Rounds.hasMany(Standings)

module.exports = Rounds;
