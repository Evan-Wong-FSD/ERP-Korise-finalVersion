// export function materialsListBackend () {
module.exports = function () {
  const express = require('express')
  const app = express()
  // const http = require('http').Server(app)
  // const port = 3009
  const http = require('http')
  const server = http.createServer(app)
  app.set('port', process.env.PORT || 3009)
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

  server.listen(app.get('port'), function () {
    console.log('listening on *:3009')
  })

  const getParam = (href, strKey) => href.searchParams.get(strKey)

  app.get('/api/requestMaterialsList', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        client.db('ERP').collection('materialsInform').find({}).toArray((err1, document) => {
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

  app.get('/api/requestMaterialsListData', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`)
        const 產品種類 = getParam(href, '產品種類'), 產品材質 = getParam(href, '產品材質'), 管材口徑 = getParam(href, '管材口徑'), 型號 = getParam(href, '型號')
        const $match = 管材口徑 ? { 產品種類, 產品材質, 管材口徑, 型號 } : { 產品種類, 產品材質, 型號 }
        client.db('ERP').collection('materialsList').aggregate([{ $match }]).toArray((err1, document) => {
          try {
            res.send({
              tableTitle: Object.values($match).join('-'),
              materialsList: document
            })
            client.close()
          } catch (err1) {
            res.end()
            client.close()
            console.error(err0)
          }
        })
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  app.get('/api/filterSelects', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async (err0, client) => {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`)
        const label = getParam(href, 'label'), typeIn = getParam(href, 'typeIn')
        const $addFields = { matched: { $regexMatch: { input: `$firmInform.${label}`, regex: typeIn, options: "i" } } }
        const $match = { matched: true }, $project = { _id: 0, matched: 0, contactPersonInform: 0 }
        const $group = Object.assign({ _id: null }, Object.fromEntries([[label, { $addToSet: `$firmInform.${label}` }]]))
        client.db('ERP').collection('firmInform').aggregate([{ $addFields }, { $match }, { $project }, { $group }]).toArray((err1, document) => {
          try {
            res.send({ options: document.length === 0 ? [] : document[0][label].slice(0, 5) })
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

  app.post('/api/autoComplete', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, (err0, client) => {
    try {
      const { itemNeededToComplete, itemCompleted } = req.body
      const $match = Object.fromEntries([[`firmInform.${itemCompleted.label}`, itemCompleted.input]])
      const $project = Object.assign({ _id: 0 }, Object.fromEntries([[`firmInform.${itemNeededToComplete.label}`, 1]]))
      client.db('ERP').collection('firmInform').aggregate([{ $match }, { $project }, { $limit: 1 }]).toArray((err1, document) => {
        try {
          res.send({ inputAutoCompleted: document.length > 0 ? document[0].firmInform[itemNeededToComplete.label] : null })
          client.close()
        } catch (error) {
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

  app.post('/api/createMaterialsList', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async (err0, client) => {
      try {
        const { inputboxs, materialSelectedDetail } = req.body
        const field = Object.values(inputboxs).reduce((total, elem) => {
          return Object.assign(total, Object.fromEntries([[elem.label, elem.value]]))
        }, materialSelectedDetail)
        client.db('ERP').collection('materialsList').aggregate([{ $match: field }]).toArray(async (err1, document) => {
          try {
            if (document.length === 0) {
              try {
                await client.db('ERP').collection('materialsList').insertOne(field)
                res.send({ type: 'positive', message: '新增成功', field })
                client.close
              } catch (error) {
                res.send({ type: 'negative', message: '新增失敗。' })
                client.close()
                console.error(error)
              }
            } else {
              res.send({ type: 'negative', message: '資料已存在，請匆重複輸入。' })
              client.close()
            }
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

  app.post('/api/updateMaterialsList', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async (err0, client) => {
      try {
        const { _id, inputboxs, materialSelectedDetail } = req.body
        const field = Object.values(inputboxs).reduce((total, elem) => {
          return Object.assign(total, Object.fromEntries([[elem.label, elem.value]]))
        }, materialSelectedDetail)
        try {
          await client.db('ERP').collection('materialsList').updateOne({ _id: new ObjectID(_id) }, { $set: field })
          res.send({ type: 'positive', message: '更新成功。', field: Object.assign(field, { _id }) })
          client.close()
        } catch (error) {
          res.send({ type: 'negative', message: '更新失敗。' })
          client.close()
          console.error(error)
        }
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  app.get('/api/deleteMaterialListSelected', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async (err0, client) => {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`)
        const id = getParam(href, 'id')
        try {
          await client.db('ERP').collection('materialsList').deleteOne({ _id: new ObjectID(id) })
          res.send({ type: 'positive', message: '刪除成功。' })
          client.close()
        } catch (error) {
          res.send({ type: 'negative', message: '刪除失敗。' })
          client.close()
          console.error(error)
        }
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  // http.listen(port, function () {
  //   console.log('listening on *:3009')
  // })
}