const CategoryDTO = require('./category.dto');
const StandingDTO = require('./standing_wop.dto');
const dateHelper = require('../helpers/date.helper');

module.exports.convertToExport = async (player) => {
  return {
    uuid: player.uuid,
    start_number: player.start_number,
    name: player.name,
    city: player.city,
    club: player.club,
    category: (player.category) ? await CategoryDTO.convertToExport(player.category) : null,

    borndate: (player.borndate) ? dateHelper.convertToBr(player.borndate) : null,

    int_id: player.int_id,
    int_rating: player.int_rating,

    xz_id: player.xz_id,
    xz_rating: player.xz_rating,

    nat_id: player.nat_id,
    nat_rating: player.nat_rating,

    fide_id: player.fide_id,
    fide_rating: player.fide_rating,

    category_uuid: player.categoryUuid,
    tournament_uuid: player.tournamentUuid,

    temporary_tournament_info: player.temporary_tournament_info,

    standings: (player.standings) ? await StandingDTO.convertToExportList(player.standings) : null,
  }
}

module.exports.convertToImport = async (player) => {
  // return {
  //   uuid: player.uuid,
  //   start_number: player.start_number,
  //   name: player.name,
  //   city: player.city,
  //   club: player.club,
  //   category: (category_get.ok === 1) ? category_get.category : null,

  //   borndate: (player.borndate) ? dateHelper.convertToBr(player.borndate) : null,

  //   int_id: player.int_id,
  //   int_rating: player.int_rating,

  //   xz_id: player.xz_id,
  //   xz_rating: player.xz_rating,

  //   nat_id: player.nat_id,
  //   nat_rating: player.nat_rating,

  //   fide_id: player.fide_id,
  //   fide_rating: player.fide_rating,

  //   categoryUuid: player.category_uuid,
  //   tournamentUuid: player.tournament_uuid,

  //   temporary_tournament_info: player.temporary_tournament_info,
  // }
}
