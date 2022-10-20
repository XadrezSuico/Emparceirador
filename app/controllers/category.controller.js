const database = require('../db/db');
const Categories = require('../models/category.model');

const dateHelper = require("../helpers/date.helper");

module.exports.setEvents = (ipcMain) => {
  database.sync();

  ipcMain.handle('model.categories.listAll', listAll)
  ipcMain.handle('model.categories.listFromTournament', listFromTournament)
  ipcMain.handle('model.categories.create', create)
  ipcMain.handle('model.categories.get', get)
  ipcMain.handle('model.categories.update', update)
}

async function create(event, tournament_uuid, category){
  try {
      let resultadoCreate = await Categories.create({
        name: category.name,
        abbr: category.abbr,

        tournamentUuid: tournament_uuid,
      })
      console.log(resultadoCreate);
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
      console.log(resultado);
      return {ok:1,error:0};
    } catch (error) {
        console.log(error);
    }

}
