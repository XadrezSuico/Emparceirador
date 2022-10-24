const Events = require('./event.basic.model');
const Tournaments = require('./tournament.basic.model');

Events.hasMany(Tournaments)

module.exports = Events;
