const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const mongodump = (collection) => {
  const exec = require('child_process').exec
  // var ls = exec(`"C:/Program Files/MongoDB/Server/4.2/bin/mongodump.exe" --port 12345 -d ERP -c ${collection} --archive=/Users/evan/MyDriver/Korise/projects/ERP-Korise/src/pages/Backend/mongodbBackup/${collection} --gzip`)
  var ls = exec(`mongodump --port 27017 -d ERP -c ${collection} --archive=/Users/evan/MyDriver/Korise/projects/ERP-Korise/src/pages/Backend/mongodbBackup/${collection} --gzip`)

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

MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  if (err0) {
    console.error(err0)
    client.close()
    return
  }

  client.db('ERP').listCollections().toArray((err1, collectionInform) => {
    if (err1) {
      console.error(err1)
      client.close()
      return
    }

    client.close()

    collectionInform.forEach(elem => {
      mongodump(elem.name)
    })
  })
})
