const { dialog, BrowserWindow, ipcMain } = require('electron')
const crypto = require('crypto')
const fs = require('fs')

const { uuid } = require('uuidv4');

const EventsController = require("./event.controller");
const TournamentsController = require("./tournament.controller");
const PlayersController = require("./player.controller");
const RoundsController = require("./round.controller");
const PairingsController = require("./pairing.controller");
const CategoriesController = require("./category.controller");

const TournamentDTO = require("../dto/tournament.dto")
const PlayerDTO = require("../dto/player.dto")
const RoundsDTO = require("../dto/round.dto")
const PairingsDTO = require("../dto/pairing.dto")

module.exports.setEvents = (ipcMain) => {
  ipcMain.handle('controller.import-export.open_import_dialog', open_file_dialog)
  ipcMain.handle('controller.import-export.save_file_dialog', save_file_dialog)
  ipcMain.handle('controller.import-export.export_event', export_event)
  ipcMain.handle('controller.import-export.test', test)

  ipcMain.addListener("controller.import-export.export_event", export_event);

  ipcMain.handle('controller.import-export.import_event', import_event)

}

module.exports.save_file_dialog = save_file_dialog
module.exports.export_event = export_event

function test(){
  console.log("chegou no teste")

}

async function open_file_dialog(event,data) {
  console.log("Open file dialog");
  let open_request = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    filters: [{ name: "Arquivo do XadrezSuíço Emparceirador", extensions: ["xadrezsuico-json"] }],
    properties: ['openFile']
  });

  if (!open_request.canceled) {
    console.log("Confirmed");
    console.log(open_request);

    await import_event(null, open_request.filePaths[0],data);
  } else {
    console.log("Rejected");
  }

}
async function import_event(e, file_path, data) {
  console.log("import_event");
  console.log(file_path);
  console.log(data);
  try {
    let data_request = {};
    if (data) {
      data_request = data;
    }
    if (!file_path) {
      if (data_request) {
        if (data_request.file_path) {
          console.log("file_path at the data");
          file_path = data_request.file_path;
        }
      }
    }
    if(file_path){
      fs.readFile(file_path, 'utf8', async (err, data) => {
        if (err) {
          return console.log(err);
        }
        let file_obj = JSON.parse(data);

        let hash = getHash(JSON.stringify(file_obj.event));

        if (hash === file_obj.hash || !(hash === file_obj.hash) && data_request.is_hash_confirmed) {
          console.log("hash is the same or accepted to read")


          let event_request = await EventsController.get(null,file_obj.event.uuid);
          if (event_request.ok === 0 || (event_request.ok === 1 && data_request.is_replace_confirmed)){
            if(event_request.ok === 1){
              await EventsController.remove(null,file_obj.event.uuid);
            }

            // console.log(file_obj.event);

            let ids = await checkIds(file_obj.event);

            let file_event_obj = file_obj.event;

            file_event_obj.uuid = ids[file_event_obj.uuid];
            file_event_obj.file_path = file_path;

            let new_event_request = await EventsController.import(null, file_event_obj, true);
            if (new_event_request.ok === 1){
              // console.log("new_event_request");
              for(let tournament_obj of file_event_obj.tournaments){
                tournament_obj.uuid = ids[tournament_obj.uuid];

                let new_tournament_request = await TournamentsController.import(null, file_event_obj.uuid, tournament_obj, true);
                if (new_tournament_request.ok === 1) {
                  // console.log("new_tournament_request");
                  for(let category_obj of tournament_obj.categories){
                    category_obj.uuid = ids[category_obj.uuid];
                    let new_category_request = await CategoriesController.import(null, tournament_obj.uuid, category_obj, true);
                    // console.log("new_category_request");
                  }

                  for(let player_obj of tournament_obj.players){
                    player_obj.uuid = ids[player_obj.uuid];
                    player_obj.category_uuid = ids[player_obj.category_uuid];
                    let new_player_request = await PlayersController.import(null, tournament_obj.uuid, player_obj, true);
                    // console.log("new_player_request");
                  }

                  for (let round_obj of tournament_obj.rounds) {
                    round_obj.uuid = ids[round_obj.uuid];
                    let new_round_request = await RoundsController.import(null, tournament_obj.uuid, round_obj);
                    if(new_round_request.ok === 1){
                      // console.log("new_round_request");
                      for (let pairing_obj of round_obj.pairings) {
                        pairing_obj.uuid = ids[pairing_obj.uuid];
                        pairing_obj.player_a_uuid = ids[pairing_obj.player_a_uuid];
                        pairing_obj.player_b_uuid = (pairing_obj.player_b_uuid) ? ids[pairing_obj.player_b_uuid] : null;
                        let new_pairing_request = await PairingsController.import(null, round_obj.uuid, pairing_obj);
                        // console.log("new_pairing_request");
                        // if(pairing_obj.have_result){
                        //   let update_pairing_request = await PairingsController.update(null, pairing_obj, true);
                        // }
                      }
                    }
                  }

                  let first_round = await RoundsController.getByNumber(null, tournament_obj.uuid, 1);
                  if (first_round === 1) {
                    console.log("first_round");
                    let update_standings_request = await RoundsController.updateStandings(null,first_round.round.uuid);
                    console.log("update_standings_request");
                  }
                }
              }

              if (ipcMain.webContents) {
                ipcMain.webContents.send("controllers.events.imported", {uuid:file_event_obj.uuid});
              } else {
                BrowserWindow.getFocusedWindow().webContents.send("controllers.events.imported", { uuid: file_event_obj.uuid });
              }
            }
          }else{
            let data_confirmed = data_request;
            data_confirmed.is_replace_confirmed = true;


            if (ipcMain.webContents) {
              ipcMain.webContents.send(
                "controllers.events.import.confirm",
                {
                  file_path: file_path,
                  message: "O evento parece já estar cadastrado no sistema. Deseja sobreescrever os dados do arquivo no XadrezSuíço Emparceirador?",
                  confirmed: data_confirmed
                }
              );
            } else {
              BrowserWindow.getFocusedWindow().webContents.send(
                "controllers.events.import.confirm",
                {
                  file_path: file_path,
                  message: "O evento parece já estar cadastrado no sistema. Deseja sobreescrever os dados do arquivo no XadrezSuíço Emparceirador?",
                  confirmed: data_confirmed
                }
              );
            }
          }

        }else{
          console.log("hash is different")

          let data_confirmed = data_request;
          data_confirmed.is_hash_confirmed = true;

          if (ipcMain.webContents) {
            ipcMain.webContents.send(
              "controllers.events.import.confirm",
              {
                file_path:file_path,
                message: "O arquivo parece ter sido alterado. Deseja importá-lo mesmo assim?",
                confirmed: data_confirmed
              }
            );
          } else {
            BrowserWindow.getFocusedWindow().webContents.send(
              "controllers.events.import.confirm",
              {
                file_path: file_path,
                message: "O arquivo parece ter sido alterado. Deseja importá-lo mesmo assim?",
                confirmed: data_confirmed
              }
            );
          }

        }
      });
    }else{
      console.log("file_path null")
    }
  } catch (error) {
    return console.log(err);
  }
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

async function checkIds(event){
  // return new Promise(async (myResolve, myReject) => {
    // console.log(event);

    let ids = [];

    ids[event.uuid] = event.uuid;

    for(let tournament of event.tournaments){
      let tournament_check = await TournamentsController.get(null,tournament.uuid);
      if (tournament_check.ok === 1) {
        ids[tournament.uuid] = uuid();
      } else {
        ids[tournament.uuid] = tournament.uuid;
      }

      for (let category of tournament.categories) {
        let category_check = await CategoriesController.get(null, category.uuid)
        if (category_check.ok === 1) {
          ids[category.uuid] = uuid();
        } else {
          ids[category.uuid] = category.uuid;
        }
      }

      for (let player of tournament.players) {
        let player_check = await PlayersController.get(null, player.uuid)
        if (player_check.ok === 1) {
          ids[player.uuid] = uuid();
        } else {
          ids[player.uuid] = player.uuid;
        }
      }

      for (let round of tournament.rounds) {
        let round_check = await RoundsController.get(null, round.uuid)
        if (round_check.ok === 1) {
          ids[round.uuid] = uuid();
        } else {
          ids[round.uuid] = round.uuid;
        }


        for (let pairing of round.pairings) {
          let pairing_check = await PairingsController.get(null, pairing.uuid)
          if (pairing_check.ok === 1) {
            ids[pairing.uuid] = uuid();
          } else {
            ids[pairing.uuid] = pairing.uuid;
          }
        }
      }

    }

    console.log(ids);
    return ids;
  //   myResolve(ids);
  // });
}


function getHash(string){
  return crypto.createHash('sha256').update(string).digest('hex')
}
