const database = require('../db/db');

const tiebreakHelper = require("../helpers/tiebreak.helper")


module.exports.setEvents = (ipcMain) => {
  ipcMain.handle('controller.tiebreaks.get', get)
  ipcMain.handle('controller.tiebreaks.getSwiss', getSwiss)
};

function get() {
  let tiebreaks = tiebreakHelper.tiebreaks();

  return { ok: 1, error: 0, tiebreaks: tiebreaks }
}

function getSwiss() {
  let tiebreaks = tiebreakHelper.tiebreaks();

  let swiss_tiebreaks = [];

  for (let tiebreak of tiebreaks) {
    if (tiebreak.is_swiss) {
      swiss_tiebreaks.push(tiebreak);
    }
  }

  return { ok: 1, error: 0, tiebreaks: swiss_tiebreaks }
}

