const dateHelper = require("../helpers/date.helper");

module.exports.convertToExport = async (event) => {
  return {
    uuid: event.uuid,
    name: event.name,
    date_start: dateHelper.convertToBr(event.date_start),
    date_finish: dateHelper.convertToBr(event.date_finish),
    place: event.place,
    time_control: event.time_control
  }
}

module.exports.convertToExportList = async (events) => {
  let events_export = [];
  let i = 0;
  for (let event of events) {
    events_export[i++] = await this.convertToExport(event);
  }

  return events_export;
}
