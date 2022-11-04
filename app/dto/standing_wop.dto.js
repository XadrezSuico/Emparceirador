const RoundDTO = require('./round.dto');
const TournamentDTO = require('./tournament.dto');
const CategoryDTO = require('./category.dto');

module.exports.convertToExport = async (standing) => {
  return {
    uuid: standing.uuid,
    round_number: standing.round_number,
    place: standing.place,
    category_place: standing.category_place,
    points: standing.points,
    tiebreaks: standing.tiebreaks,

    player: null,
    round: (standing.round) ? await RoundDTO.convertToExport(standing.round) : null,
    tournament: (standing.tournament) ? await TournamentDTO.convertToExport(standing.tournament) : null,
    category: (standing.category) ? await CategoryDTO.convertToExport(standing.category) : null,
  }
}
module.exports.convertToExportList = async (standings) => {
  let standings_export = [];
  let i = 0;
  for(let standing of standings){
    standings_export[i++] = await this.convertToExport(standing);
  }

  return standings_export;
}
