const Sequelize = require('sequelize');
const database = require('../db/db');
const Categories = require('./category.model');
const Players = require('./player.model');
const Rounds = require('./round.model');

const Tournaments = database.define('tournaments', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  uuid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tournament_type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  rounds_number: {
    type: Sequelize.INTEGER,
    allowNull: true
  },

  ordering_sequence: {
    type: Sequelize.JSON,
    allowNull: true
  }
})

Tournaments.hasMany(Players)
Tournaments.hasMany(Categories)
Tournaments.hasMany(Rounds)

module.exports = Tournaments;
