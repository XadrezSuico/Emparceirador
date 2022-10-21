const Sequelize = require('sequelize');
const database = require('../db/db');

const Pairs = require("./pair.model")

const Rounds = database.define('rounds', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  uuid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  number: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
})

Rounds.hasMany(Pairs,{
  foreignKey: "player_a_uuid"
})
Rounds.hasMany(Pairs,{
  foreignKey: "player_b_uuid"
})

module.exports = Rounds;
