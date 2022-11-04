module.exports.convertToExport = async (category) => {
  return {
    uuid: category.uuid,
    name: category.name,
    abbr: category.abbr,
  }
}

module.exports.convertToExportList = async (categories) => {
  let categories_export = [];
  let i = 0;
  for (let category of categories) {
    categories_export[i++] = await this.convertToExport(category);
  }

  return categories_export;
}
