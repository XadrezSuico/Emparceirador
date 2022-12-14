const Categories = require('./category.basic.model');
const Players = require('./player.basic.model');
const Rounds = require('./round.basic.model');
const Standings = require('./standing.basic.model');
const Tournaments = require('./tournament.basic.model');
const Events = require('./event.basic.model');

Tournaments.belongsTo(Events)

Tournaments.hasMany(Players,{
  onDelete:"CASCADE"
})
Tournaments.hasMany(Rounds,{
  onDelete:"CASCADE"
})
Tournaments.hasMany(Standings,{
  onDelete:"CASCADE"
})
Tournaments.hasMany(Categories,{
  onDelete:"CASCADE"
})

module.exports = Tournaments;
