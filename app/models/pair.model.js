const Sequelize = require('sequelize');
const database = require('../db/db');

const Pairs = database.define('pairs', {
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
    primaryKey: true,
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
    primaryKey: true,
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


  is_bye: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: true
  },
})

module.exports = Pairs;
