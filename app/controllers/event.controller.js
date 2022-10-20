const database = require('../db/db');
const Events = require('../models/event.model');

const dateHelper = require("../helpers/date.helper");

module.exports.setEvents = (ipcMain) => {
  ipcMain.handle('model.events.listAll', listAll)
  ipcMain.handle('model.events.create.example', createExample)
  ipcMain.handle('model.events.create', create)
  ipcMain.handle('model.events.get', get)
  ipcMain.handle('model.events.update', update)
  ipcMain.handle('model.events.remove', remove)
}

async function create(event, xadrezsuico){
  try {
        await database.sync();

        const resultadoCreate = await Events.create({
            name: xadrezsuico.name,
            date_start: dateHelper.convertToSql(xadrezsuico.date_start),
            date_finish: dateHelper.convertToSql(xadrezsuico.date_finish),
            time_control: xadrezsuico.time_control,
            place: xadrezsuico.place,
        })
        return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
    } catch (error) {
        console.log(error);
    }
}

async function createExample(){
  try {
        const resultado = await database.sync();
        console.log(resultado);

        const resultadoCreate = await Events.create({
            uuid: '6bcf27ea-7cf9-493b-b71a-f544d98607d0',
            name: 'Evento X',
            date_start: '2022-11-01',
            date_finish: '2022-11-01',
            time_control: 'RPD',
            place: 'Local',
        })
        console.log(resultadoCreate);
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

    let event_return = {
      uuid: event.uuid,
      name: event.name,
      date_start: dateHelper.convertToBr(event.date_start),
      date_finish: dateHelper.convertToBr(event.date_finish),
      place: event.place,
      time_control: event.time_control
    };

    return {ok:1,error:0,event:event_return};
  } catch (error) {
      console.log(error);
  }
}


async function update(e,event){
  try {
      let resultado = await Events.update({
      name: event.name,
      date_start: dateHelper.convertToSql(event.date_start),
      date_finish: dateHelper.convertToSql(event.date_finish),
      place: event.place,
      time_control: event.time_control
      },{
        where:{
          uuid:event.uuid
        }
      })
      console.log(resultado);
      return {ok:1,error:0};
    } catch (error) {
        console.log(error);
    }

}
async function remove(e,uuid) {
  try {
    let event = await Events.findByPk(uuid);

    if(event){
      Events.destroy({
        where: {
          uuid: uuid
        }
      });
      return {ok:1,error:0};
    }else{
      return {ok:0,error:1,message:"Evento não encontrado"};
    }

  } catch (error) {
      console.log(error);
  }
}
