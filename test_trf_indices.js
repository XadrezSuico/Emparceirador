const official = "001    1 mGM  Santiago,Yago De Moura            2504 BRA     2103877 1992/00/00  6.5    7    43 w 1    24 b 1    12 w 1     6 b =    22 w 1    10 b 1     3 w 0     9 b 0    15 w 1  ";
const mine = "001    1 m    teste 1                              0                             0.0    1     4 w -                                                              ";

console.log("Official length:", official.length);
console.log("Mine length:    ", mine.length);
console.log("");
console.log("             1         2         3         4         5         6         7         8         9         10        11        12        13        14        15        16");
console.log("   012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890");
console.log("O: " + official);
console.log("M: " + mine);
console.log("Diff indices:");
console.log("Points:");
console.log("O: '" + official.substring(80, 84) + "'");
console.log("M: '" + mine.substring(80, 84) + "'");
console.log("Rank:");
console.log("O: '" + official.substring(85, 89) + "'");
console.log("M: '" + mine.substring(85, 89) + "'");
console.log("Round 1:");
console.log("O: '" + official.substring(91, 101) + "'");
console.log("M: '" + mine.substring(91, 101) + "'");

