const { BrowserWindow } = require('electron');

const { uuid } = require('uuidv4');


const database = require('../db/db');
const Events = require('../models/event.model');

const ImportExportController = require("./import-export.controller");
const EventDeleteController = require("./event-delete.controller");

const dateHelper = require("../helpers/date.helper");
const { ipcMain } = require('electron');

module.exports.setEvents = (ipcMain) => {
  ipcMain.handle('controller.events.listAll', listAll)
  ipcMain.handle('controller.events.create.example', createExample)
  ipcMain.handle('controller.events.create', create)
  ipcMain.handle('controller.events.get', get)
  ipcMain.handle('controller.events.update', update)
  ipcMain.handle('controller.events.remove', remove)
  ipcMain.handle('controller.events.delete', remove)

  ipcMain.addListener("controller.events.need_export", need_export);
}

module.exports.get = get
module.exports.create = create
module.exports.import = Import
module.exports.update = update
module.exports.remove = remove
module.exports.listAll = listAll

async function need_export(event_uuid) {
  let event_request = await get(null, event_uuid);
  if (event_request.ok === 1) {
    ipcMain.emit("controller.import-export.export_event", event_uuid);
  }
}

async function create(e, event, is_import = false){
  try {
    await database.sync();

    console.log("create event");
    console.log(event);

    const resultadoCreate = await Events.create({
        name: event.name,
        date_start: dateHelper.convertToSql(event.date_start),
        date_finish: dateHelper.convertToSql(event.date_finish),
        time_control: event.time_control,
        place: event.place,
        file_path: event.file_path,
    })

    ipcMain.emit("controller.import-export.export_event",resultadoCreate.uuid);

    return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
  } catch (error) {
      console.log(error);
  }
}

async function Import(e, event) {
  try {
    await database.sync();

    console.log(event);

    const resultadoCreate = await Events.create({
      uuid: (event.uuid) ? event.uuid : uuid(),
      name: event.name,
      date_start: dateHelper.convertToSql(event.date_start),
      date_finish: dateHelper.convertToSql(event.date_finish),
      time_control: event.time_control,
      place: event.place,
      file_path: event.file_path,
    })

    return { ok: 1, error: 0, data: { uuid: resultadoCreate.uuid } };
  } catch (error) {
    console.log(error);
  }
}

async function createExample(){
  try {
        const resultado = await database.sync();
        // console.log(resultado);

        const resultadoCreate = await Events.create({
            uuid: '6bcf27ea-7cf9-493b-b71a-f544d98607d0',
            name: 'Evento X',
            date_start: '2022-11-01',
            date_finish: '2022-11-01',
            time_control: 'RPD',
            place: 'Local',
        })
        // console.log(resultadoCreate);
    } catch (error) {
        console.log(error);
    }
}

async function listAll() {
  try {
    const events = await Events.findAll();
    let events_return = [];
    let i = 0;
    for(let event of events){
      let event_return = {
        uuid: event.uuid,
        name: event.name,
        date_start: dateHelper.convertToBr(event.date_start),
        date_finish: dateHelper.convertToBr(event.date_finish),
        place: event.place,
        time_control: event.time_control,
        file_path: event.file_path,
      };

      events_return[i++] = event_return;
    }
    return {ok:1,error:0,events:events_return};
  } catch (error) {
      console.log(error);
  }
}


async function get(e,uuid) {
  try {
    const event = await Events.findByPk(uuid);

    if(event){

      let event_return = {
        uuid: event.uuid,
        name: event.name,
        date_start: dateHelper.convertToBr(event.date_start),
        date_finish: dateHelper.convertToBr(event.date_finish),
        place: event.place,
        time_control: event.time_control,
        file_path: event.file_path,
      };

      return { ok: 1, error: 0, event: event_return };
    }else{
      return { ok: 0, error: 1, message: "Evento não encontrado", not_found: true };
    }
  } catch (error) {
      console.log(error);
  }
  return { ok: 0, error: 1, message: "Erro ainda desconhecido", not_found: false };
}


async function update(e,event){
  try {
      let resultado = await Events.update({
      name: event.name,
      date_start: dateHelper.convertToSql(event.date_start),
      date_finish: dateHelper.convertToSql(event.date_finish),
      place: event.place,
      time_control: event.time_control,
      file_path: event.file_path,
      },{
        where:{
          uuid:event.uuid
        }
      })
    // console.log(resultado);

      ipcMain.emit("controller.import-export.export_event", event.uuid);
      return {ok:1,error:0};
    } catch (error) {
        console.log(error);
    }

}
async function remove(e,uuid) {
  try {
    let event = await Events.findByPk(uuid);

    if(event){
      await EventDeleteController.remove(uuid);
      return {ok:1,error:0};
    }else{
      return {ok:0,error:1,message:"Evento não encontrado"};
    }

  } catch (error) {
      console.log(error);
  }
}
