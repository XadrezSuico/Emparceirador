const Sequelize = require('sequelize');
const database = require('../db/db');

const Standings = database.define('standings', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  uuid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  round_number: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  place: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  category_place: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  points: {
    type: Sequelize.NUMBER,
    allowNull: false
  },
  tiebreaks:{
    type: Sequelize.JSON,
    allowNull: true
  }
})

module.exports = Standings;
