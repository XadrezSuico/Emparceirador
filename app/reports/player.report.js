const electron = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');


var options = {
  landscape: false,
  marginsType: 0,
  printBackground: false,
  printSelectionOnly: false,
  pageSize: "A4",
};

let window_to_PDF;


module.exports.setEvents = (ipcMain, pdf_window) => {
  window_to_PDF = pdf_window;

  window_to_PDF.webContents.on('did-finish-load', () => {
    // Use default printing options
    const pdfPath = path.join(os.homedir(), 'Desktop', 'temp.pdf')
    window_to_PDF.webContents.printToPDF(options).then(data => {
      fs.writeFile(pdfPath, data, (error) => {
        if (error) throw error
        console.log(`Wrote PDF successfully to ${pdfPath}`)
      })
    }).catch(error => {
      console.log(`Failed to write PDF to ${pdfPath}: `, error)
    })
  })


  ipcMain.handle('reports.players.listReport', listReport)
}

async function listReport(name,tournament,players) {


  console.log("finished");
}
