const Sequelize = require('sequelize');
const database = require('../db/db');

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

module.exports = Rounds;
