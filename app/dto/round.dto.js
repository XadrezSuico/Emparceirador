const TournamentDTO = require('./tournament.dto');
const CategoryDTO = require('./category.dto');
module.exports.convertToExport = async (round) => {
  return {
    uuid: round.uuid,
    number: round.number,
    tournament_uuid: round.tournamentUuid,
    tournament: (round.tournament) ? await TournamentDTO.convertToExport(round.tournament) : null,
  }
}
module.exports.convertToExportList = async (rounds) => {
  let rounds_export = [];
  let i = 0;
  for (let round of rounds) {
    rounds_export[i++] = await this.convertToExport(standing);
  }

  return rounds_export;
}
