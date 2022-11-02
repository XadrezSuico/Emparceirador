const Pairings = require('./pairing.basic.model');
const Players = require('./player.basic.model');
const Rounds = require('./round.basic.model');

Pairings.belongsTo(Rounds)

Pairings.belongsTo(Players,{
  foreignKey: "player_a_uuid",
  as: "player_a",
  onDelete:"CASCADE"
})
Pairings.belongsTo(Players,{
  foreignKey: "player_b_uuid",
  as: "player_b",
  onDelete:"CASCADE"
})


module.exports = Pairings;
