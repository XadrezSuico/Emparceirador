const Standings = require('./standing.basic.model');
const Tournaments = require('./tournament.basic.model');
const Categories = require('./category.basic.model');
const Players = require('./player.basic.model');
const Rounds = require('./round.basic.model');

Standings.belongsTo(Categories)
Standings.belongsTo(Players)
Standings.belongsTo(Tournaments)
Standings.belongsTo(Rounds)

module.exports = Standings;
