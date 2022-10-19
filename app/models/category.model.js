const Sequelize = require('sequelize');
const database = require('../db/db');
const Players = require('./player.model');

const Categories = database.define('categories', {
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
  abbr: {
    type: Sequelize.STRING,
    allowNull: true
  },
})

Categories.hasMany(Players)

module.exports = Categories;
