import {app, BrowserWindow, ipcMain, screen, dialog} from 'electron';
const PDFWindow = require('electron-pdf-window')
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve --inspect=5858');

let size;
let browser_window_opts;
let browser_window_pdf_opts;
let pdf_window;



function createWindow(): BrowserWindow {
  size = screen.getPrimaryDisplay().workAreaSize;

  browser_window_pdf_opts = {
    show: true,
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  }
  browser_window_opts = {
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
    icon: __dirname + '/dist/assets/xs-e.png',
  }

  // Create the browser window.
  win = new BrowserWindow(browser_window_opts);

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

    if (process.platform !== 'darwin') {
      app.quit();
    }
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

    marginTop: "15px",
    marginBottom: "15px",
    marginLeft: "15px",
    marginRight: "15px",
  };

  // Use default printing options
  if (!fs.existsSync(path.join(app.getPath('userData'), '__temp_reports'))) {
    fs.mkdirSync(path.join(app.getPath('userData'), '__temp_reports'));
  }

  // window_to_PDF.webContents.on('did-finish-load', () => {
  //   setTimeout(() => {
  //     const pdfPath = path.join(app.getPath('userData'), '__temp_reports', 'report.pdf')
  //     console.log(window_to_PDF.webContents.toString())
  //     window_to_PDF.webContents.printToPDF(options).then(data => {
  //       fs.writeFile(pdfPath, data, (error) => {
  //         if (error) throw error
  //         console.log(`Wrote PDF successfully to ${pdfPath}`)
  //       })
  //     }).catch(error => {
  //       console.log(`Failed to write PDF to ${pdfPath}: `, error)
  //     })
  //   }, 500);
  // })

  return window_to_PDF;
}

async function checkIfJavaExists(callback_error,callback_ok){
    var spawn = require('child_process').spawn('java', ['-version']);
    spawn.on('error', function(err){
        return callback_error(err);
    })
    spawn.stderr.on('data', function(data) {
        data = data.toString().split('\n')[0];
        var javaVersion = new RegExp('version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
        if (javaVersion != false) {
          // TODO: We have Java installed
          return callback_ok(javaVersion);
        } else {
          // TODO: No Java installed
          return callback_error({message:"Para executar o XadrezSuíço Emparceirador é necessário que possua o Java instalado em seu computador. Por favor, instale e tente novamente."});
        }
    });
}

function checkIfJaVaFoIsDownloaded(){

}

function createShowPdfWindow() {
  const win = new PDFWindow(browser_window_opts)

  return win;
}

async function generateAndOpenPdf(angular_path){
  // Path when running electron executable
  let pathIndex = './index.html';

  if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
    pathIndex = '../dist/index.html';
  }

  const url = new URL(path.join('file:', __dirname, pathIndex));

  console.log(url);
  console.log(url.href.concat("?elec_route=").concat(angular_path));

  await pdf_window.loadURL(url.href.concat("?elec_route=").concat(angular_path)); //give the file link you want to display

  var options = {
    landscape: true,
    marginsType: 0,
    printBackground: false,
    printSelectionOnly: false,
    pageSize: "A4",

    marginTop: "15px",
    marginBottom: "15px",
    marginLeft: "15px",
    marginRight: "15px",
  };

  setTimeout(() => {
      const pdfPath = path.join(app.getPath('userData'), '__temp_reports', 'report.pdf')
      console.log(pdf_window.webContents.toString())
      pdf_window.webContents.printToPDF(options).then(data => {
        fs.writeFile(pdfPath, data, (error) => {
          if (error) throw error
          console.log(`Wrote PDF successfully to ${pdfPath}`)
        })
      }).catch(error => {
        console.log(`Failed to write PDF to ${pdfPath}: `, error)
      })
  }, 500);

  setTimeout(() => {

    let window_show_pdf = createShowPdfWindow();

    const pdf_url = new URL(path.join(app.getPath('userData'), '__temp_reports', 'report.pdf'));
    window_show_pdf.loadURL(pdf_url.href)

    window_show_pdf.setTitle("Relatório");

  }, 1500);
}

const event_controller = require("./controllers/event.controller")
const tournament_controller = require("./controllers/tournament.controller")
const player_controller = require("./controllers/player.controller")
const category_controller = require("./controllers/category.controller")
const round_controller = require("./controllers/round.controller")
const pairing_controller = require("./controllers/pairing.controller")
const standing_controller = require("./controllers/standing.controller")
const tiebreak_controller = require("./controllers/tiebreak.controller")

const import_export_controller = require("./controllers/import-export.controller")

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', async () => {

    await checkIfJavaExists(
      async (error)=>{
        if(error.message){
          dialog.showMessageBox(null,{
            message:error.message,
            type:"error",
          });
        }else{
          dialog.showMessageBox(null,{
            message:"Ocorreu um erro desconhecido",
            type:"error",
          });
        }
      },


      async (version)=>{
        pdf_window = await createPdfWindow();


        setTimeout(async () =>{
          ipcMain.on('set-title', setTitle)
          event_controller.setEvents(ipcMain)
          tournament_controller.setEvents(ipcMain)
          category_controller.setEvents(ipcMain)
          player_controller.setEvents(ipcMain, generateAndOpenPdf)
          round_controller.setEvents(ipcMain)
          pairing_controller.setEvents(ipcMain, generateAndOpenPdf)
          standing_controller.setEvents(ipcMain, generateAndOpenPdf)
          tiebreak_controller.setEvents(ipcMain)

          import_export_controller.setEvents(ipcMain)



          setTimeout(async () =>{
            createWindow();
          }, 400)
        }, 400)
      }


    );
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

ipcMain.handle('app.version', getVersion);

function getVersion(){
  return app.getVersion();
}
