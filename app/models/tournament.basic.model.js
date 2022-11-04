const Sequelize = require('sequelize');
const database = require('../db/db');

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
  table_start_number: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
    allowNull: true
  },

  ordering_sequence: {
    type: Sequelize.JSON,
    allowNull: true
  },
  tiebreaks: {
    type: Sequelize.JSON,
    allowNull: true
  }
})


module.exports = Tournaments;
