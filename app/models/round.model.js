const Categories = require('./category.basic.model');
const Pairings = require('./pairing.basic.model');
const Rounds = require('./round.basic.model');
const Standings = require('./standing.basic.model');
const Tournaments = require('./tournament.basic.model');

Rounds.belongsTo(Tournaments)

Rounds.hasMany(Pairings,{
  onDelete:"CASCADE"
})
Rounds.hasMany(Standings,{
  onDelete:"CASCADE"
})

module.exports = Rounds;
