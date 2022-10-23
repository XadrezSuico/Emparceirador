module.exports.getAllResultsPossible = async (round_number) => {
  let c = 0;
  let i = round_number;
  let results_possible = [];
  while(i >= 0){
    if(i === round_number){
      results_possible[c++] = i;
    }else{
      results_possible[c++] = i + 0.5;
      results_possible[c++] = i;
    }
     i--;
  }

  return results_possible;
}
