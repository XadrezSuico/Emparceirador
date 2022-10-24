const Players = require('./player.basic.model');
const Categories = require('./category.basic.model');
const Tournaments = require('./tournament.basic.model');
const Pairings = require('./pairing.basic.model');
const Standings = require('./standing.basic.model');

Players.belongsTo(Tournaments)
Players.belongsTo(Categories)

Players.hasMany(Pairings, {
  foreignKey: "player_a_uuid",
  as: "player_a"
})
Players.hasMany(Pairings, {
  foreignKey: "player_b_uuid",
  as: "player_b"
})
Players.hasMany(Standings)


module.exports = Players;
