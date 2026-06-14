const TRFHelper = require('./app/helpers/trf.helper');

let tournament = { name: "teste", rounds_number: 7 };
let event = { place: "", date_start: "2026-06-08", date_finish: "2026-06-08" };
let players = [
    { start_number: 1, name: "teste 1", fide_rating: 0, fide_id: "", borndate: "" }
];

let trfContent = TRFHelper.generateTRF(tournament, event, players, [], []);
const fs = require('fs');
fs.writeFileSync('/home/joao/.config/xadrezsuico-emparceirador/input.trf', trfContent);
console.log(trfContent);
