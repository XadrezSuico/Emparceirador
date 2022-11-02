const Categories = require('./category.basic.model');
const Players = require('./player.basic.model');
const Standings = require('./standing.basic.model');
const Tournaments = require('./tournament.basic.model');

Categories.belongsTo(Tournaments)
Categories.hasMany(Players,{
  onDelete:"CASCADE"
})
Categories.hasMany(Standings,{
  onDelete:"CASCADE"
})

module.exports = Categories;
