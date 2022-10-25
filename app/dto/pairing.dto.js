module.exports.convertToExport = async (pairing) => {
  return {
    uuid: pairing.uuid,
    number: pairing.number,
    player_a_uuid: pairing.player_a_uuid,
    player_a_result: pairing.player_a_result,
    player_a_wo: pairing.player_a_wo,
    player_b_uuid: pairing.player_b_uuid,
    player_b_result: pairing.player_b_result,
    player_b_wo: pairing.player_b_wo,
    have_result: pairing.have_result,
    is_bye: pairing.is_bye,
    round_uuid: pairing.roundUuid,
  }
}
