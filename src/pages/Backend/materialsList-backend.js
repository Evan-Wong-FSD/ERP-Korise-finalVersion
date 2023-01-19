export function materialsListBackend () {
  const express = require('express')
  const app = express()
  const http = require('http').Server(app)
  var io = require('socket.io')(http, {
    allowEIO3: true,
    cors: {
      origin: 'http://localhost:8080',
      methods: ['GET', 'POST'],
      allowedHeaders: ['*'],
      credentials: true
    }
  })
  const port = 3004
  const mongodb = require('mongodb')
  const ObjectID = mongodb.ObjectID
  const MongoClient = mongodb.MongoClient

  app.use(express.json())
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST')
    // res.header('Access-Control-Allow-Methods', '*')
    res.header('Access-Control-Allow-Headers', '*')
    next()
  })

  app.post('/api/getRowsData', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        const { materialsInform } = req.body
        client.db('ERP').collection('materialsList').aggregate([{ $match: materialsInform }]).toArray((err1, document) => {
          if (!err1) {
            res.send({
              rowsData: document.reverse()
            })
            client.close()
            res.end()
          } else {
            console.log('Error => ', err1)
            client.close()
            res.end()
          }
        })
      } else {
        console.log('Error => ', err0)
        client.close()
        res.end()
      }
    })
  })

  app.post('/api/initializeForTree', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('materialsInform').aggregate([{ $project: { _id: 0, 統編: 1, 公司名稱: 1, 產品名稱: 1, 型號: 1 } }]).toArray((err1, document) => {
          if (!err1) {
            res.send({
              arrMaterialsInform: document
            })
            client.close()
            res.end()
          } else {
            console.log('Error => ', err1)
            client.close()
            res.end()
          }
        })
      } else {
        console.log('Error => ', err0)
        client.close()
        res.end()
      }
    })
  })

  app.post('/api/createMaterial', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const { materialInform } = req.body
        await client.db('ERP').collection('materialsList').insertOne(materialInform)
        res.end()
        client.close()
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  app.post('/api/updateMaterial', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const { materialInform } = req.body
        materialInform._id = new ObjectID(materialInform._id)
        await client.db('ERP').collection('materialsList').updateOne({ _id: materialInform._id }, { $set: materialInform })
        res.end()
        client.close()
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  io.on('connection', (socket) => {
    socket.on('delete', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          (async () => {
            await client.db('ERP').collection('materialsList').deleteOne({ _id: new mongodb.ObjectID(frontendData.tableSelectedID) })
            io.emit('deleteSucceed', {
              message: '刪除成功'
            })
            client.close()
          })()
        } else {
          console.log('Error => ', err0)
          client.close()
        }
      })
    })
  })

  http.listen(port, function () {
    console.log('listening on *:3004')
  })
}
