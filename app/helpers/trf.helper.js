const fs = require('fs');

class TRFHelper {

    static padString(str, length, padLeft = false) {
        if (str === null || str === undefined) str = "";
        str = String(str).substring(0, length);
        if (padLeft) {
            return str.padStart(length, ' ');
        } else {
            return str.padEnd(length, ' ');
        }
    }

    static generateTRF(tournament, event, players, rounds, pairings) {
        let trf = [];
        trf.push(`012  ${this.padString(tournament.name || event.name || "", 30)}`);
        trf.push(`022  ${this.padString(event.place || "", 30)}`);
        trf.push(`032  `);
        trf.push(`042  ${event.date_start ? event.date_start.replace(/-/g, '/') : ""}`);
        trf.push(`052  ${event.date_finish ? event.date_finish.replace(/-/g, '/') : ""}`);
        trf.push(`062  ${players.length}`);
        trf.push(`072  ${players.filter(p => p.fide_rating).length}`);
        trf.push(`082  0`);
        trf.push(`092  Indiv`);
        trf.push(`102  `);
        trf.push(`112  `);
        trf.push(`122  `);

        let datesLine = `132                                                                                        `;
        for (let i = 0; i < tournament.rounds_number; i++) {
            datesLine += `          `;
        }
        trf.push(datesLine);
        trf.push(`XXR  ${tournament.rounds_number}`);

        for (let p of players) {
            let pLine = `001 `;
            pLine += this.padString(p.start_number, 4, true) + " ";
            pLine += this.padString("m", 1) + "";
            pLine += this.padString("", 3) + " "; // title
            pLine += this.padString(p.name, 33) + " ";
            pLine += this.padString(p.fide_rating || "0", 4, true) + " ";
            pLine += this.padString("", 3) + " "; // federation
            pLine += this.padString(p.fide_id || "", 11, true) + " ";
            pLine += this.padString(p.borndate ? p.borndate.replace(/-/g, '/') : "", 10) + " ";

            let playerPoints = 0;
            for (let pair of pairings) {
                if (pair.have_result) {
                    if (pair.player_a_uuid === p.uuid) {
                        playerPoints += parseFloat(pair.player_a_result) || 0;
                    } else if (pair.player_b_uuid === p.uuid) {
                        playerPoints += parseFloat(pair.player_b_result) || 0;
                    }
                } else {
                    // FIDE C.04.1.b: "For pairing purposes only, a game without result is treated as a draw"
                    playerPoints += 0.5;
                }
            }
            let pointsStr = playerPoints.toFixed(1);

            pLine += this.padString(pointsStr, 4, true) + " "; // Points (81-84) + space (85)
            pLine += this.padString(p.start_number, 4, true) + "  "; // Rank (86-89) + 2 spaces (90-91)

            let rData = "";
            for (let i = 1; i <= tournament.rounds_number; i++) {
                let round = rounds.find(r => r.number === i);
                let roundPairing = null;
                if (round) {
                    roundPairing = pairings.find(pair => pair.round_uuid === round.uuid && (pair.player_a_uuid === p.uuid || pair.player_b_uuid === p.uuid));
                }

                if (roundPairing) {
                    let isPlayerA = roundPairing.player_a_uuid === p.uuid;
                    let opponentUuid = isPlayerA ? roundPairing.player_b_uuid : roundPairing.player_a_uuid;

                    if (opponentUuid) {
                        let opponent = players.find(op => op.uuid === opponentUuid);
                        let oppRank = opponent ? opponent.start_number : "0000";
                        let color = isPlayerA ? 'w' : 'b';
                        if (roundPairing.color_a && roundPairing.color_a === 'w') {
                            color = isPlayerA ? 'w' : 'b';
                        } else if (roundPairing.color_a && roundPairing.color_a === 'b') {
                            color = isPlayerA ? 'b' : 'w';
                        }

                        let result = "0"; // FIDE C.04.1.b: Sem resultado é tratado como empate para emparceiramento
                        if (roundPairing.have_result) {
                            if (isPlayerA) {
                                if (roundPairing.player_a_wo) result = roundPairing.player_a_result > 0 ? "+" : "-";
                                else if (roundPairing.player_a_result == 1) result = "1";
                                else if (roundPairing.player_a_result == 0) result = "0";
                                else if (roundPairing.player_a_result == 0.5) result = "=";
                            } else {
                                if (roundPairing.player_b_wo) result = roundPairing.player_b_result > 0 ? "+" : "-";
                                else if (roundPairing.player_b_result == 1) result = "1";
                                else if (roundPairing.player_b_result == 0) result = "0";
                                else if (roundPairing.player_b_result == 0.5) result = "=";
                            }
                        }
                        rData += this.padString(oppRank, 4, true) + " " + color + " " + result + "  ";
                    } else {
                        // Bye
                        rData += "0000 - U  "; // Pairing allocated bye
                    }
                } else {
                    rData += "          "; // Nao emparceirado
                }
            }
            pLine += rData;
            trf.push(pLine);
        }

        return trf.join('\r\n') + '\r\n';
    }

    static parseTRFToPairings(trfContent, roundNumber) {
        let lines = trfContent.split(/\r?\n/);
        let pairings = [];
        let parsedPlayers = {};

        for (let line of lines) {
            if (line.startsWith("001 ")) {
                let startNumber = parseInt(line.substring(4, 8).trim());
                let roundStartIndex = 91 + ((roundNumber - 1) * 10);

                if (line.length >= roundStartIndex + 8) {
                    let oppRankStr = line.substring(roundStartIndex, roundStartIndex + 4).trim();
                    let color = line.substring(roundStartIndex + 5, roundStartIndex + 6);
                    let oppRank = parseInt(oppRankStr);

                    parsedPlayers[startNumber] = { oppRank, color };
                }
            }
        }

        let matched = new Set();
        for (let p in parsedPlayers) {
            let playerRank = parseInt(p);
            if (matched.has(playerRank)) continue;

            let data = parsedPlayers[playerRank];
            if (!isNaN(data.oppRank) && data.oppRank > 0) {
                // Oponente real
                matched.add(playerRank);
                matched.add(data.oppRank);
                pairings.push({
                    player_a: playerRank,
                    player_b: data.oppRank,
                    color_a: data.color
                });
            } else if (!isNaN(data.oppRank) && data.oppRank === 0 && data.color === '-') {
                // Bye
                matched.add(playerRank);
                pairings.push({
                    player_a: playerRank,
                    player_b: null,
                    color_a: 'w' // bye
                });
            }
        }

        return pairings;
    }
}

module.exports = TRFHelper;
