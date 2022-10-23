const Sequelize = require('sequelize');
const database = require('../db/db');
const Players = require('./player.model');
const Rounds = require('./round.model');

const Pairings = database.define('pairings', {
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


  player_a_uuid: {
    type: Sequelize.UUID,
    allowNull: false
  },
  player_a_result: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  player_a_wo: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: true
  },

  player_b_uuid: {
    type: Sequelize.UUID,
    allowNull: true
  },
  player_b_result: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  player_b_wo: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: true
  },


  have_result: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: true
  },
  is_bye: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: true
  },
})
Pairings.belongsTo(Rounds)

Pairings.belongsTo(Players,{
  foreignKey: "player_a_uuid",
  as: "player_a"
})
Pairings.belongsTo(Players,{
  foreignKey: "player_b_uuid",
  as: "player_b"
})


module.exports = Pairings;
