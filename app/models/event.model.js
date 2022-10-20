const Sequelize = require('sequelize');
const database = require('../db/db');
const moment = require('moment');
const Tournaments = require('./tournament.model');

const Events = database.define('events', {
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
  date_start: {
    type: Sequelize.DATE,
    allowNull: true,
    get: function() {
      return moment.utc(this.getDataValue('date_start')).format('YYYY-MM-DD');
    }
  },
  date_finish: {
    type: Sequelize.DATE,
    allowNull: true,
    get: function() {
      return moment.utc(this.getDataValue('date_finish')).format('YYYY-MM-DD');
    }
  },
  time_control: {
    type: Sequelize.STRING,
    allowNull: false
  },
  place: {
    type: Sequelize.STRING,
    allowNull: false
  },
})

Events.hasMany(Tournaments)

module.exports = Events;
