const Categories = require('./category.basic.model');
const Players = require('./player.basic.model');
const Rounds = require('./round.basic.model');
const Standings = require('./standing.basic.model');
const Tournaments = require('./tournament.basic.model');

Tournaments.hasMany(Players)
Tournaments.hasMany(Rounds)
Tournaments.hasMany(Standings)
Tournaments.hasMany(Categories)

module.exports = Tournaments;
