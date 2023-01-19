export function firmInformBackend () {
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
  const port = 3001
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

  app.post('/api/filterFirmKeyInform', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.log('Error => ', err0)
        client.close()
        return
      }
      const { searchKey, inputValue } = req.body
      const $project = Object.fromEntries([['_id', 0], [`firmInform.${searchKey}`, 1]])
      client.db('ERP').collection('firmInform').aggregate([{ $project }]).toArray((err1, document) => {
        if (err1) {
          console.log('Error => ', err0)
          client.close()
          return
        }
        let arrResult = document.filter(elem => String(elem.firmInform[searchKey]).includes(inputValue))
        arrResult = arrResult.map(elem => elem.firmInform[searchKey])
        res.send({ arrResult })
        client.close()
      })
    })
  })

  app.post('/api/getBasicFirmInfrom', (req, res) => {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.log('Error => ', err0)
        client.close()
        return
      }
      const { searchKey, searchValue } = req.body
      const $match = Object.fromEntries([[`firmInform.${searchKey}`, searchValue]])
      const $project = {
        _id: 0,
        'firmInform.統編': 1,
        'firmInform.公司名稱': 1,
        'firmInform.傳真': 1,
        'contactPersonInform.聯絡人名稱': 1,
        'contactPersonInform.聯絡人電話': 1
      }
      client.db('ERP').collection('firmInform').aggregate([{ $project }, { $match }]).toArray(async (err1, document) => {
        if (err1) {
          console.log('Error => ', err0)
          client.close()
          return
        }
        const objResult = {}
        const basicFirmInform = document[0]
        await Object.values(basicFirmInform).forEach(objElem => {
          if ('傳真' in objElem) {
            let { 傳真國際區號, 傳真區碼, 傳真號碼 } = objElem.傳真
            傳真國際區號 = 傳真國際區號 === '886' ? '' : `(${傳真國際區號}) `
            objElem.傳真 = `${傳真國際區號}${傳真區碼} - ${傳真號碼}`
          } else if ('聯絡人電話' in objElem) {
            let { 電話國際區號, 電話區碼, 電話號碼, 電話分機 } = objElem.聯絡人電話
            電話國際區號 = 電話國際區號 === '886' ? '' : `(${電話國際區號}) `
            電話分機 = 電話分機 ? ` #${電話分機}` : ''
            objElem.聯絡人電話 = `${電話國際區號}${電話區碼} - ${電話號碼}${電話分機}`
          }
          Object.assign(objResult, objElem)
        })
        const { 統編, 公司名稱, 傳真, 聯絡人名稱, 聯絡人電話 } = objResult
        class BasicFirmInform {
          constructor (taxIdNum, client, fax, contactPerson, phone) {
            this.統編 = taxIdNum
            this.客戶名稱 = client
            this.客戶傳真 = fax
            this.連絡人 = contactPerson
            this.客戶電話 = phone
          }
        }
        res.send(new BasicFirmInform(統編, 公司名稱, 傳真, 聯絡人名稱, 聯絡人電話))
        client.close()
      })
    })
  })

  app.post('/api/initializeForSheet', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('firmInform').aggregate([{ $match: {} }]).toArray((err1, document) => {
          if (!err1) {
            res.send({
              arrFirmInform: document
            })
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

  app.post('/api/initializeForRecord', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        const { taxIdNumExist, _id = '', taxIdNumber = '' } = req.body
        if (taxIdNumExist) {
          const $match = { 'firmInform.統編': taxIdNumber }
          if (_id) $match._id = _id
          client.db('ERP').collection('firmInform').aggregate([{ $match }, { $project: { _id: 0 } }]).toArray((err2, document2) => {
            res.send({
              recordData: document2[0]
            })
            client.close()
            res.end()
          })
        } else {
          client.db('ERP').collection('firmInform').aggregate([{ $match: {} }]).toArray((err2, document2) => {
            if (!err2) {
              const data = {
                _id: [],
                taxIdNums: [],
                firmName: []
              }
              document2.forEach(elem => {
                data._id.splice(data._id.length, 0, elem._id)
                data.taxIdNums.splice(data.taxIdNums.length, 0, elem.firmInform.統編)
                data.firmName.splice(data.firmName.length, 0, elem.firmInform.公司名稱)
              })
              res.send({
                _id: data._id,
                taxIdNums: data.taxIdNums,
                firmName: data.firmName
              })
              client.close()
              res.end()
            } else {
              console.log('Error => ', err2)
              client.close()
              res.end()
            }
          })
        }
      } else {
        console.log('Error => ', err0)
        client.close()
        res.end()
      }
    })
  })

  io.on('connection', (socket) => {
    socket.on('submit', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          const { firmInformData } = frontendData
          const trimSpace = (inform) => {
            for (const data in inform) {
              if (inform[data] !== null) {
                if (typeof inform[data] === 'object') {
                  trimSpace(inform[data])
                  continue
                }
                inform[data] = inform[data].trim()
              }
            }
          }

          delete firmInformData.hideDropdownIcon
          for (const inform in firmInformData) {
            trimSpace(firmInformData[inform])
          }

          if (frontendData.taxIdNumExist) {
            (async () => {
              await client.db('ERP').collection('firmInform').updateOne({ _id: new mongodb.ObjectID(frontendData._id) }, { $set: firmInformData })
              client.close()
            })()
          } else {
            (async () => {
              await client.db('ERP').collection('firmInform').insertOne(firmInformData)
              client.close()
            })()
          }
        } else {
          console.log('Error => ', err0)
          client.close()
        }
      })
    })
    socket.on('delete', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          (async () => {
            await client.db('ERP').collection('firmInform').deleteOne({ _id: new mongodb.ObjectID(frontendData._id) })
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
    console.log('listening on *:3001')
  })
}
