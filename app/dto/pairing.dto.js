const PlayerDTO = require("./player.dto")

module.exports.convertToExport = async (pairing, table_start_number = 1) => {
  return {
    uuid: pairing.uuid,
    number: (pairing.number + table_start_number - 1),
    player_a: (pairing.player_a) ? await PlayerDTO.convertToExport(pairing.player_a) : null,
    player_a_uuid: pairing.player_a_uuid,
    player_a_result: pairing.player_a_result,
    player_a_wo: pairing.player_a_wo,
    player_b: (pairing.player_b) ? await PlayerDTO.convertToExport(pairing.player_b) : null,
    player_b_uuid: pairing.player_b_uuid,
    player_b_result: pairing.player_b_result,
    player_b_wo: pairing.player_b_wo,
    have_result: pairing.have_result,
    is_bye: pairing.is_bye,
    round_uuid: pairing.roundUuid,
  }
}

module.exports.convertToExportList = async (pairings, table_start_number = 1) => {
  let pairings_export = [];
  for (let pairing of pairings) {
    pairings_export[pairings_export.length] = await this.convertToExport(pairing, table_start_number);
  }

  return pairings_export;
}
