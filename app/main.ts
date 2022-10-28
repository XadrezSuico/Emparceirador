import {app, BrowserWindow, ipcMain, screen} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve --inspect=5858');


function createWindow(): BrowserWindow {

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });

  if (serve) {
    console.log("serve: yes")
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    console.log("serve: no")
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
       // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    console.log(url.href);
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

function createPdfWindow(): BrowserWindow {
  let window_to_PDF = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });//to just open the browser in background


  var options = {
    landscape: true,
    marginsType: 0,
    printBackground: false,
    printSelectionOnly: false,
    pageSize: "A4",
  };
  window_to_PDF.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      // Use default printing options
      const pdfPath = path.join(__dirname, '__temp_reports', 'report.pdf')
      window_to_PDF.webContents.printToPDF(options).then(data => {
        fs.writeFile(pdfPath, data, (error) => {
          if (error) throw error
          console.log(`Wrote PDF successfully to ${pdfPath}`)
        })
      }).catch(error => {
        console.log(`Failed to write PDF to ${pdfPath}: `, error)
      })
    }, 500);
  })

  return window_to_PDF;
}

const event_controller = require("./controllers/event.controller")
const tournament_controller = require("./controllers/tournament.controller")
const player_controller = require("./controllers/player.controller")
const category_controller = require("./controllers/category.controller")
const round_controller = require("./controllers/round.controller")
const pairing_controller = require("./controllers/pairing.controller")
const standing_controller = require("./controllers/standing.controller")
const tiebreak_controller = require("./controllers/tiebreak.controller")

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', async () => {
    const pdf_window = await createPdfWindow();


    setTimeout(async () =>{
      ipcMain.on('set-title', setTitle)
      event_controller.setEvents(ipcMain)
      tournament_controller.setEvents(ipcMain)
      category_controller.setEvents(ipcMain)
      player_controller.setEvents(ipcMain, pdf_window)
      round_controller.setEvents(ipcMain)
      pairing_controller.setEvents(ipcMain)
      standing_controller.setEvents(ipcMain)
      tiebreak_controller.setEvents(ipcMain)



      setTimeout(async () =>{
        createWindow();
      }, 400)
    }, 400)
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

async function setTitle(event,title){
  if(title == ""){
    win.setTitle("XadrezSuíço Emparceirador")
  }else{
    win.setTitle(title.concat(" - XadrezSuíço Emparceirador"))
  }
}
