const child_process = require('child_process');
async function checkJava() {
    return new Promise((resolve) => {
        var spawn = child_process.spawn('java', ['-version']);
        let output = '';
        spawn.on('error', function(err){
            resolve({ ok: 0, message: err.message });
        });
        spawn.stderr.on('data', function(data) {
            output += data.toString();
        });
        spawn.on('close', function() {
            let firstLine = output.split('\n')[0];
            var javaVersion = new RegExp('version').test(firstLine) ? firstLine.split(' ')[2].replace(/"/g, '') : false;
            if (javaVersion != false) {
                resolve({ ok: 1, version: javaVersion });
            } else {
                resolve({ ok: 0, message: "Java não encontrado", out: output });
            }
        });
    });
}
checkJava().then(console.log);
