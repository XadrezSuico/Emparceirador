const Sequelize = require('sequelize');
const database = require('../db/db');
const Categories = require('./category.model');
const Players = require('./player.model');

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
})

Tournaments.hasMany(Players)
Tournaments.hasMany(Categories)

module.exports = Tournaments;
