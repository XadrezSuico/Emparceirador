const CategoryDTO = require("./category.dto")

module.exports.convertToExport = async (tournament) => {
  return {
    uuid: tournament.uuid,
    name: tournament.name,
    tournament_type: tournament.tournament_type,
    rounds_number: tournament.rounds_number,
    ordering_sequence: (tournament.ordering_sequence) ? tournament.ordering_sequence : [],
    tiebreaks: (tournament.tiebreaks) ? tournament.tiebreaks : [],
    categories: (tournament.categories) ? await CategoryDTO.convertToExportList(tournament.categories) : [],
    event_uuid: tournament.eventUuid,
  }
}

module.exports.convertToExportList = async (tournaments) => {
  let tournaments_export = [];
  let i = 0;
  for (let tournament of tournaments) {
    tournaments_export[i++] = await this.convertToExport(tournament);
  }

  console.log(tournaments_export);

  return tournaments_export;
}
