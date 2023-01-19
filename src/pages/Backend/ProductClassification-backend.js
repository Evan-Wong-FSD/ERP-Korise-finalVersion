export function ProductClassificationBackend () {
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
  const port = 3002
  const mongodb = require('mongodb')
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
        client.db('ERP').collection('ProductClassification').aggregate([{ $match: {} }]).toArray((err1, document) => {
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

  app.post('/api/getProductClassoptions', function (req, res) {
    const { productClassTypeIn } = req.body
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const $addFields = { productClassMatched: { $regexMatch: { input: '$產品種類', regex: productClassTypeIn, options: 'i' } } }
        const $match = { productClassMatched: true }, $project = { _id: 0, 產品種類: 1 }
        client.db('ERP').collection('ProductClassification').aggregate([{ $addFields }, { $match }, { $project }]).toArray((err1, document) => {
          try {
            console.log('document')
            console.log(document)
            res.send({ productClassoptions: [...new Set(document.map(elem => elem.產品種類))] })
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

  app.post('/api/getProductNameOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        return
      }
      const { productClass, inputValue } = req.body
      const $match = productClass.value ? { 產品種類: productClass.value } : {}
      client.db('ERP').collection('ProductClassification').aggregate([{ $match }, { $project: { _id: 0, 產品名稱: 1 } }]).toArray((err1, document) => {
        if (err1) {
          console.error(err1)
          client.close()
          return
        }
        document = document.filter(elem => elem.產品名稱.includes(inputValue))
        const arrResult = [...new Set(document.map(elem => elem.產品名稱))]
        res.send({ arrResult })
        client.close()
      })
    })
  })

  app.post('/api/getModelOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.log(err0)
        return
      }
      const { productName } = req.body
      client.db('ERP').collection('materialsInform').aggregate([{ $match: { 產品名稱: productName } }, { $project: { _id: 0, 型號: 1 } }]).toArray((err1, document) => {
        if (err1) {
          console.error(err1)
          client.close()
          return
        }
        if (document.length) {
          const arrResult = [...new Set(document.map(elem => elem.型號))]
          res.send({ arrResult })
        }
        res.end()
        client.close()
      })
    })
  })

  app.post('/api/getPricesOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.log(err0)
        return
      }
      const { productName, model } = req.body
      client.db('ERP').collection('invoiceRecord').aggregate([{ $match: { 進銷項: '銷項', 產品名稱: productName, 型號: model } }, { $project: { _id: 0, 單價: 1 } }]).toArray((err1, document) => {
        try {
          res.send({ arrResult: [...new Set(document.map(elem => elem.單價))] })
          client.close()
        } catch (err1) {
          res.end()
          console.error(err1)
          client.close()
        }
      })
    })
  })

  app.post('/api/initializeProductClass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('firmInform').aggregate([{ $match: {} }, { $project: { _id: 0, contactPersonInform: 0 } }]).toArray((err1, document) => {
          if (!err1) {
            const data = {
              taxIdNums: [],
              firmName: []
            }
            document.forEach(elem => {
              data.taxIdNums.splice(data.taxIdNums.length, 0, elem.firmInform.統編)
              data.firmName.splice(data.firmName.length, 0, elem.firmInform.公司名稱)
            })
            res.send(data)
            client.close()
          } else {
            console.log('Error => ', err1)
            client.close()
          }
        })
      } else {
        console.log('Error => ', err0)
        client.close()
      }
    })
  })

  app.post('/api/createProductClass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, async function (err0, client) {
      if (!err0) {
        const { productInform } = req.body
        await client.db('ERP').collection('ProductClassification').insertOne(productInform)
        client.close()
        res.end()
      } else {
        console.log('Error => ', err0)
        client.close()
      }
    })
  })

  app.post('/api/updateProductClass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, async function (err0, client) {
      if (!err0) {
        const { selected, 產品種類, 產品名稱, code, 統編, 公司名稱 } = req.body.productInform
        await client.db('ERP').collection('ProductClassification').updateOne(
          { _id: new mongodb.ObjectID(selected[0]._id) },
          {
            $set: {
              產品種類: 產品種類,
              產品名稱: 產品名稱,
              code: code,
              統編: 統編,
              公司名稱: 公司名稱
            }
          }
        )
        client.close()
        res.end()
      } else {
        console.log('Error => ', err0)
        client.close()
      }
    })
  })

  io.on('connection', (socket) => {
    socket.on('deleteProductClassification', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          (async () => {
            await client.db('ERP').collection('ProductClassification').deleteOne({ _id: new mongodb.ObjectID(frontendData.selected[0]._id) })
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
    console.log('listening on *:3002')
  })
}
