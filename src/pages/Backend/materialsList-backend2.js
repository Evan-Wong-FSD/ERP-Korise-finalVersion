export function materialsListBackend2 () {
  const express = require('express')
  const app = express()
  const http = require('http').Server(app)
  const port = 3009
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

  const getParam = (href, strKey) => href.searchParams.get(strKey)

  app.get('/api/requestMaterialsList', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`)
        const materialsPrintedAmount = getParam(href, 'materialsPrintedAmount')
        client.db('ERP').collection('materialsInform').find({}).limit(Number(materialsPrintedAmount)).toArray((err1, document) => {
          try {
            res.send({ materialsInform: document })
            client.close()
          } catch (err1) {
            res.end()
            client.close()
            console.error(err1)
          }
        })
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  http.listen(port, function () {
    console.log('listening on *:3009')
  })
}