const database = require('../db/db');
const Categories = require('../models/category.model');
const { ipcMain } = require('electron');

const dateHelper = require("../helpers/date.helper");

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('controller.categories.listAll', listAll)
  ipcMain.handle('controller.categories.listFromTournament', listFromTournament)
  ipcMain.handle('controller.categories.create', create)
  ipcMain.handle('controller.categories.get', get)
  ipcMain.handle('controller.categories.update', update)
  ipcMain.handle('controller.categories.remove', remove)

  ipcMain.addListener("controller.categories.need_export", need_export);
}

module.exports.create = create;
module.exports.listAll = listAll;
module.exports.listFromTournament = listFromTournament;
module.exports.get = get;
module.exports.update = update;
module.exports.remove = remove;

async function need_export(category_uuid){
  let category_request = await get(null,category_uuid);
  if (category_request.ok === 1) {
    ipcMain.emit("controller.tournaments.need_export", category_request.category.tournament_uuid);
  }
}

async function create(event, tournament_uuid, category){
  try {
      let resultadoCreate = await Categories.create({
        name: category.name,
        abbr: category.abbr,

        tournamentUuid: tournament_uuid,
      })
      // console.log(resultadoCreate);

      need_export(resultadoCreate.uuid);
      return {ok:1,error:0,data:{uuid:resultadoCreate.uuid}};
    } catch (error) {
        console.log(error);
    }
}

async function listAll() {
  try {
    let categories = await Categories.findAll();
    let categories_return = [];
    let i = 0;
    for(let category of categories){
      let category_return = {
        uuid: category.uuid,
        name: category.name,
        abbr: category.abbr,

        tournament_uuid: category.tournamentUuid,
      };

      categories_return[i++] = category_return;
    }
    return {ok:1,error:0,categories:categories_return};
  } catch (error) {
      console.log(error);
  }
}

async function listFromTournament(event,tournament_uuid) {
  try {
    let categories = await Categories.findAll({
      where: {
        tournamentUuid: tournament_uuid
      }
    });
    let categories_return = [];
    let i = 0;
    for(let category of categories){
      let category_return = {
        uuid: category.uuid,
        name: category.name,
        abbr: category.abbr,

        tournament_uuid: category.tournamentUuid,
      };

      categories_return[i++] = category_return;
    }
    return {ok:1,error:0,categories:categories_return};
  } catch (error) {
      console.log(error);
  }
}


async function get(e,uuid) {
  try {
    let category = await Categories.findByPk(uuid);

      let category_return = {
        uuid: category.uuid,
        name: category.name,
        abbr: category.abbr,

        tournament_uuid: category.tournamentUuid,
      };

    return {ok:1,error:0,category:category_return};
  } catch (error) {
      console.log(error);
  }
}

async function update(e,category){
  try {
      let resultado = await Categories.update({
        name: category.name,
        abbr: category.abbr,
      },{
        where:{
          uuid:category.uuid
        }
      })
      // console.log(resultado);
      need_export(category.uuid);
      return {ok:1,error:0};
    } catch (error) {
        console.log(error);
    }

}
async function remove(e,uuid) {
  try {
    let category = await Categories.findByPk(uuid);

    if(category){
      Categories.destroy({
        where: {
          uuid: uuid
        }
      });
      ipcMain.emit("controller.tournaments.need_export", category.tournamentUuid);
      return {ok:1,error:0};
    }else{
      return {ok:0,error:1,message:"Categoria não encontrada"};
    }

  } catch (error) {
      console.log(error);
  }
}
