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
