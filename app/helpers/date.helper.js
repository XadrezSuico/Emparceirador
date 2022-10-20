module.exports.convertToSql = (date_from) => {
  parts = date_from.split("/");

  return parts[2].concat("-").concat(parts[1]).concat("-").concat(parts[0]);
}
module.exports.convertToBr = (date_from) => {
  if(date_from !== 'Invalid date'){
    console.log(date_from);
    parts = date_from.split("-");

    return parts[2].concat("/").concat(parts[1]).concat("/").concat(parts[0]);
  }
  return '';
}
