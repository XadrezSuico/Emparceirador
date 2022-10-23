module.exports.convertToExport = async (category) => {
  return {
    uuid: category.uuid,
    name: category.name,
    abbr: category.abbr,
  }
}
