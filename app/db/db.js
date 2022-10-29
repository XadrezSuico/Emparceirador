const Sequelize = require('sequelize');
const { app } = require('electron')
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: app.getPath('userData').concat('/database.sqlite'),

    logging:false
})

module.exports = sequelize;
