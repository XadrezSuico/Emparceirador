const CategoryDTO = require("./category.dto")
const EventDTO = require("./event.dto")

module.exports.convertToExport = async (tournament) => {
  return {
    uuid: tournament.uuid,
    name: tournament.name,
    tournament_type: tournament.tournament_type,
    rounds_number: tournament.rounds_number,
    table_start_number: (tournament.table_start_number) ? tournament.table_start_number : 1,
    ordering_sequence: (tournament.ordering_sequence) ? tournament.ordering_sequence : [],
    tiebreaks: (tournament.tiebreaks) ? tournament.tiebreaks : [],
    categories: (tournament.categories) ? await CategoryDTO.convertToExportList(tournament.categories) : [],
    event: (tournament.event) ? await EventDTO.convertToExport(tournament.event) : null,
    event_uuid: tournament.eventUuid,
  }
}

module.exports.convertToExportList = async (tournaments) => {
  let tournaments_export = [];
  let i = 0;
  for (let tournament of tournaments) {
    tournaments_export[i++] = await this.convertToExport(tournament);
  }

  // console.log(tournaments_export);

  return tournaments_export;
}
