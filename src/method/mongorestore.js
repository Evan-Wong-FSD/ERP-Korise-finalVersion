const fs = require('fs')

const mongorestore = (collection) => {
  const exec = require('child_process').exec
  var ls = exec(`"C:/Program Files/MongoDB/Server/4.2/bin/mongorestore.exe" --port 12345 -d ERP -c ${collection} --archive=F:/project/ERP-Korise/src/pages/Backend/mongodbBackup/${collection} --gzip`)
  // var ls = exec(`mongorestore --port 27017 -d ERP -c ${collection} --archive=F:/project/ERP-Korise/src/pages/Backend/mongodbBackup/${collection} --gzip`)

  ls.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString())
  })
  ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString())
  })
  ls.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString())
  })
}

fs.readdir('F:/project/ERP-Korise/src/pages/Backend/mongodbBackup', function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err)
  }

  files.forEach(function (collection) {
    console.log('collection')
    console.log(collection)
    mongorestore(collection)
  })
})
