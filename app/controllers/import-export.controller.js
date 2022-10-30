const { dialog, BrowserWindow, ipcMain } = require('electron')
const crypto = require('crypto')
const fs = require('fs')

const EventsController = require("./event.controller");
const TournamentsController = require("./tournament.controller");
const PlayersController = require("./player.controller");
const RoundsController = require("./round.controller");
const PairingsController = require("./pairing.controller");

const TournamentDTO = require("../dto/tournament.dto")
const PlayerDTO = require("../dto/player.dto")
const RoundsDTO = require("../dto/round.dto")
const PairingsDTO = require("../dto/pairing.dto")

module.exports.setEvents = (ipcMain) => {
  ipcMain.handle('controller.import-export.save_file_dialog', save_file_dialog)
  ipcMain.handle('controller.import-export.export_event', export_event)
  ipcMain.handle('controller.import-export.test', test)

  ipcMain.addListener("controller.import-export.export_event", export_event);
}

module.exports.save_file_dialog = save_file_dialog
module.exports.export_event = export_event

function test(){
  console.log("chegou no teste")

}

async function export_event(event_uuid){
  let event_request = await EventsController.get(null,event_uuid);
  if(event_request.ok === 1){
    let event = event_request.event;

    if (event.file_path){
      let event_to_file = {
        uuid: event.uuid,
        name: event.name,
        date_start: event.date_start,
        date_finish: event.date_finish,
        place: event.place,
        time_control: event.time_control,

        tournaments:[]
      }

      let tournaments_request = await TournamentsController.listFromEvent(null, event.uuid);
      if(tournaments_request.ok === 1){
        for (let tourn of tournaments_request.tournaments) {
          let index = event_to_file.tournaments.length;
          event_to_file.tournaments[index] = await TournamentDTO.convertToFile(tourn);

          let players_request = await PlayersController.listByTournament(null, event_to_file.tournaments[index].uuid);
          if(players_request.ok === 1){
            event_to_file.tournaments[index].players = [];
            for(let ply of players_request.players){
              let index_players = event_to_file.tournaments[index].players.length;

              event_to_file.tournaments[index].players[index_players] = await PlayerDTO.convertToFile(ply);
            }
          }


          let rounds_request = await RoundsController.listByTournament(null, event_to_file.tournaments[index].uuid);
          if (rounds_request.ok === 1) {
            event_to_file.tournaments[index].rounds = [];
            for (let rnd of rounds_request.rounds) {
              let index_rounds = event_to_file.tournaments[index].rounds.length;

              event_to_file.tournaments[index].rounds[index_rounds] = rnd;


              let pairings_request = await PairingsController.listByRound(null, rnd.uuid);
              if (pairings_request.ok === 1) {
                event_to_file.tournaments[index].rounds[index_rounds].pairings = [];


                for (let pair of pairings_request.pairings) {
                  let index_pairings = event_to_file.tournaments[index].rounds[index_rounds].pairings.length;


                  event_to_file.tournaments[index].rounds[index_rounds].pairings[index_pairings] = await PairingsDTO.convertToFile(pair);
                }
              }
            }
          }
        }
      }

      let event_string = JSON.stringify(event_to_file);

      let file_obj = {
        event: event_to_file,
        hash: getHash(event_string)
      }

      // console.log("hash")
      // console.log(file_obj.hash);
      // console.log("hash-obj")
      // console.log(getHash(JSON.stringify(file_obj.event)));
      // console.log("hash-obj2")
      // console.log(getHash(JSON.stringify((JSON.parse(JSON.stringify(file_obj))).event)));


      fs.writeFile(event.file_path, JSON.stringify(file_obj), function (err, data) {
        if (err) {
          return console.log(err);
        }
        console.log(data);
      });
    }
  }
}

async function save_file_dialog(event, renderer_event = null) {
  console.log("Open save dialog");
  let save_request = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
    filters:[{name:"Arquivo do XadrezSuíço Emparceirador",extensions:["xadrezsuico-json"]}],
    properties: ['createDirectory']
  });

  if(!save_request.canceled){
    console.log("Confirmed");
    console.log(save_request);
    if (renderer_event){
      if (ipcMain.webContents){
        ipcMain.webContents.send(renderer_event, save_request.filePath);
      }else{
        BrowserWindow.getFocusedWindow().webContents.send(renderer_event, save_request.filePath);
      }
    }
  }else{
    console.log("Rejected");
  }
}

function getHash(string){
  return crypto.createHash('sha256').update(string).digest('hex')
}
