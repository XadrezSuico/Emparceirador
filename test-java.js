const child_process = require('child_process');
async function checkJava() {
    return new Promise((resolve) => {
        var spawn = child_process.spawn('java', ['-version']);
        spawn.on('error', function(err){
            resolve({ ok: 0, message: err.message });
        });
        spawn.stderr.on('data', function(data) {
            data = data.toString().split('\n')[0];
            var javaVersion = new RegExp('version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
            if (javaVersion != false) {
                resolve({ ok: 1, version: javaVersion });
            } else {
                resolve({ ok: 0, message: "Java não encontrado" });
            }
        });
    });
}
checkJava().then(console.log);
