const Events = require('./event.basic.model');
const Tournaments = require('./tournament.basic.model');

Events.hasMany(Tournaments, {
  onDelete: "CASCADE"
})

module.exports = Events;
