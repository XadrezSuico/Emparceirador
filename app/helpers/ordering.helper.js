module.exports.orderingSqlField = (ordering) => {
  switch(ordering){
    case "BORNDATE":
      return ["borndate","ASC NULLS LAST"];
    case "ALPHABETICAL":
      return ["name","ASC"];
    case "INTERNAL_RATING":
      return ["int_rating","DESC"];
    case "XADREZSUICO_RATING":
      return ["xz_rating","DESC"];
    case "NATIONAL_RATING":
      return ["nat_rating","DESC"];
    case "FIDE_RATING":
      return ["fide_rating","DESC"];
    case "START_NUMBER":
      return ["start_number","ASC"];
    default:
      return null;
  }
}
