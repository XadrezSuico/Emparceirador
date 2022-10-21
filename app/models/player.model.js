const Sequelize = require('sequelize');
const database = require('../db/db');
const moment = require('moment');

const Players = database.define('players', {
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
  start_number: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  borndate: {
    type: Sequelize.DATE,
    allowNull: true,
    get: function() {
      return moment.utc(this.getDataValue('borndate')).format('YYYY-MM-DD');
    }
  },
  city: {
    type: Sequelize.JSON,
    allowNull: true
  },
  club: {
    type: Sequelize.JSON,
    allowNull: true
  },


  int_id: {
    type: Sequelize.STRING,
    allowNull: true
  },
  int_rating: {
    type: Sequelize.INTEGER,
    allowNull: true
  },

  xz_id: {
    type: Sequelize.STRING,
    allowNull: true
  },
  xz_rating: {
    type: Sequelize.INTEGER,
    allowNull: true
  },

  nat_id: {
    type: Sequelize.STRING,
    allowNull: true
  },
  nat_rating: {
    type: Sequelize.INTEGER,
    allowNull: true
  },

  fide_id: {
    type: Sequelize.STRING,
    allowNull: true
  },
  fide_rating: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
})

module.exports = Players;
