module.exports.convertToExport = async (tournament) => {
  return {
    uuid: tournament.uuid,
    name: tournament.name,
    tournament_type: tournament.tournament_type,
    rounds_number: tournament.rounds_number,
    ordering_sequence: tournament.ordering_sequence,
    tiebreaks: (tournament.tiebreaks) ? tournament.tiebreaks : [],
  }
}
