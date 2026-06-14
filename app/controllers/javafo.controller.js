const { dialog, BrowserWindow, ipcMain, app } = require('electron')
const fs = require('fs')
const path = require('path')
const https = require('https')
const child_process = require('child_process')
const util = require('util')
const exec = util.promisify(child_process.exec)

const TRFHelper = require('../helpers/trf.helper')
const TournamentsController = require('./tournament.controller')
const EventsController = require('./event.controller')
const PlayersController = require('./player.controller')
const RoundsController = require('./round.controller')
const PairingsController = require('./pairing.controller')

const JAVAFO_URL = "https://www.rrweb.org/javafo/current/javafo.jar"

module.exports.setEvents = (ipcMain) => {
  ipcMain.handle('controller.javafo.check', checkJaVaFo)
  ipcMain.handle('controller.javafo.check-java', checkJava)
  ipcMain.handle('controller.javafo.download', downloadJaVaFo)
  ipcMain.handle('controller.javafo.pair', generatePairings)
}

async function checkJava() {
    return new Promise((resolve) => {
        var spawn = child_process.spawn('java', ['-version'], { shell: true });
        let output = '';
        spawn.on('error', function(err){
            resolve({ ok: 0, message: err.message });
        });
        spawn.stderr.on('data', function(data) {
            output += data.toString();
        });
        spawn.stdout.on('data', function(data) {
            output += data.toString();
        });
        spawn.on('close', function() {
            let lines = output.split('\n');
            let versionLine = lines.find(line => /version/.test(line));
            var javaVersion = versionLine ? versionLine.split(' ')[2].replace(/"/g, '') : false;
            
            if (javaVersion != false) {
                resolve({ ok: 1, version: javaVersion });
            } else {
                resolve({ ok: 0, message: "Java não encontrado", debug: output });
            }
        });
    });
}

function getJavafoPath() {
  return path.join(app.getPath('userData'), 'javafo.jar');
}

async function checkJaVaFo() {
  const javafoPath = getJavafoPath();
  return fs.existsSync(javafoPath);
}

async function downloadJaVaFo(event) {
  const javafoPath = getJavafoPath();
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(javafoPath);
    https.get(JAVAFO_URL, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        let redirectUrl = response.headers.location.startsWith('http') ? response.headers.location : `https://www.rrweb.org${response.headers.location}`;
        https.get(redirectUrl, (res) => {
            if (res.statusCode !== 200) {
                fs.unlink(javafoPath, () => {});
                return resolve({ ok: 0, message: `Erro no download: HTTP ${res.statusCode}` });
            }
            res.pipe(file);
            file.on('finish', () => {
              file.close(() => resolve({ ok: 1 }));
            });
        }).on('error', (err) => {
            fs.unlink(javafoPath, () => {});
            resolve({ ok: 0, message: err.message });
        });
      } else {
        if (response.statusCode !== 200) {
            fs.unlink(javafoPath, () => {});
            return resolve({ ok: 0, message: `Erro no download: HTTP ${response.statusCode}` });
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve({ ok: 1 }));
        });
      }
    }).on('error', (err) => {
      fs.unlink(javafoPath, () => {});
      console.error("Erro ao baixar JaVaFo:", err);
      resolve({ ok: 0, message: err.message });
    });
  });
}

async function generatePairings(event, tournament_uuid, round_number) {
    try {
        const javafoPath = getJavafoPath();
        if (!fs.existsSync(javafoPath)) {
            return { ok: 0, message: "JaVaFo não está instalado" };
        }

        let tournReq = await TournamentsController.get(null, tournament_uuid);
        if (tournReq.ok !== 1) return { ok: 0, message: "Torneio não encontrado" };
        let tournament = tournReq.tournament;

        let eventReq = await EventsController.get(null, tournament.eventUuid);
        let eventData = eventReq.ok === 1 ? eventReq.event : {};

        let playersReq = await PlayersController.listByTournament(null, tournament_uuid);
        let players = playersReq.ok === 1 ? playersReq.players : [];

        let roundsReq = await RoundsController.listByTournament(null, tournament_uuid);
        let rounds = roundsReq.ok === 1 ? roundsReq.rounds : [];

        let allPairings = [];
        for (let r of rounds) {
            let pairReq = await PairingsController.listByRound(null, r.uuid);
            if (pairReq.ok === 1) {
                // pairings is in pairReq.pairings, but format could be DTO
                // we need raw or DTO. The helper uses player_a_uuid, player_b_uuid, result.
                let dtos = pairReq.pairings;
                for (let d of dtos) {
                    allPairings.push({
                        round_uuid: r.uuid,
                        player_a_uuid: d.player_a_uuid || (d.player_a ? d.player_a.uuid : null),
                        player_b_uuid: d.player_b_uuid || (d.player_b ? d.player_b.uuid : null),
                        result: d.player_a_result === 1 && d.player_b_result === 0 ? 1 : 
                                d.player_a_result === 0 && d.player_b_result === 1 ? 2 : 
                                d.player_a_result === 0.5 ? 3 : null,
                        color_a: 'w' // simplificado
                    });
                }
            }
        }

        // Generate TRF
        let trfContent = TRFHelper.generateTRF(tournament, eventData, players, rounds, allPairings);
        
        let inputPath = path.join(app.getPath('userData'), 'input.trf');
        let outputPath = path.join(app.getPath('userData'), 'output.trf');
        
        fs.writeFileSync(inputPath, trfContent, 'utf8');

        // Run JaVaFo
        let command = `java -jar "${javafoPath}" "${inputPath}" -p "${outputPath}"`;
        // Protege o comando inteiro com aspas extras para evitar o bug do cmd.exe no Windows
        let isWindows = process.platform === 'win32';
        let execCommand = isWindows ? `"${command}"` : command;

        await new Promise((resolve, reject) => {
            const execFile = child_process.exec(execCommand, (error, stdout, stderr) => {
                if (error) {
                    let javafoLog = stderr || stdout || error.message;
                    reject(new Error("Erro no JaVaFo: " + javafoLog));
                } else {
                    resolve();
                }
            });
        });

        if (!fs.existsSync(outputPath)) {
            return { ok: 0, message: "Erro na execução do JaVaFo: Arquivo de saída não gerado" };
        }

        let outContent = fs.readFileSync(outputPath, 'utf8');
        let lines = outContent.trim().split(/\r?\n/);
        let newPairings = [];
        
        if (lines.length > 0) {
            let numPairs = parseInt(lines[0].trim());
            
            if (numPairs === 0) {
                return { ok: 0, message: "Não foram encontrados emparceiramentos possíveis" };
            }

            for (let i = 1; i <= numPairs && i < lines.length; i++) {
                let parts = lines[i].trim().split(/\s+/);
                if (parts.length >= 2) {
                    let player_a = parseInt(parts[0]);
                    let player_b = parseInt(parts[1]);
                    newPairings.push({
                        player_a: player_a,
                        player_b: player_b === 0 ? null : player_b,
                        color_a: 'w' // JaVaFo output: first is white, second is black
                    });
                }
            }
        } else {
             return { ok: 0, message: "Erro na leitura do arquivo do JaVaFo" };
        }

        // Get Round UUID
        let currentRound = rounds.find(r => r.number === round_number);
        if (!currentRound) {
             let res = await RoundsController.getByNumber(null, tournament_uuid, round_number);
             if (res.ok === 1) currentRound = res.round;
        }

        if (!currentRound) {
             return { ok: 0, message: "Rodada não existe" };
        }

        // Delete existing pairings for this round just in case
        await PairingsController.removeByRound(null, currentRound.uuid);

        // Map start_number to uuid
        let startNumberToUuid = {};
        for (let p of players) {
            startNumberToUuid[p.start_number] = p.uuid;
        }

        // Save pairings
        let pNum = 1;
        for (let p of newPairings) {
            let pA = startNumberToUuid[p.player_a];
            let pB = p.player_b ? startNumberToUuid[p.player_b] : null;

            let pairingToSave = {
                number: pNum++,
                player_a_uuid: pA,
                player_b_uuid: pB,
                have_result: false
            };
            await PairingsController.create(null, currentRound.uuid, pairingToSave, tournament);
        }

        return { ok: 1 };

    } catch (err) {
        console.error(err);
        return { ok: 0, message: err.message };
    }
}

module.exports.checkJaVaFo = checkJaVaFo;
module.exports.downloadJaVaFo = downloadJaVaFo;
module.exports.generatePairings = generatePairings;
