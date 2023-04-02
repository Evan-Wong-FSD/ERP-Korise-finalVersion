// export function ProductClassification () {
module.exports = function () {
  const express = require('express')
  const app = express()
  // const http = require('http').Server(app)
  const http = require('http')
  const server = http.createServer(app)
  // const port = 3008
  app.set('port', process.env.PORT || 3008)
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
    console.log('listening on *:3008')
  })

  const getParam = (href, strKey) => href.searchParams.get(strKey)
  const transformTypeInForRegex = (string) => {
    return string.split('').reduce((str, char) => {
      return str.concat(/\W/.test(char) ? `\\${char}` : char)
    }, '')
  }

  app.get('/api/calculateRowsNumber', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`), filter = JSON.parse(getParam(href, 'filter'))
        const $addFields = {
          matched: {
            $and: await filter.reduce((total, elem) => {
              total.push({ $regexMatch: { input: { $toString: `$${elem.label}` }, regex: transformTypeInForRegex(elem.typeIn), options: 'i' } })
              return total
            }, [])
          }
        }
        const aggregateProps = filter.length > 0
          ? [{ $addFields }, { $match: { matched: true } }, { $count: 'rowsNumber' }]
          : [{ $match: {} }, { $count: 'rowsNumber' }]
        client.db('ERP').collection('ProductClassification').aggregate(aggregateProps).toArray((err1, document) => {
          try {
            res.send({ rowsNumber: document[0] })
            client.close()
          } catch (err1) {
            client.close()
            res.end()
            console.log(err0)
          }
        })
      } catch (err0) {
        client.close()
        res.end()
        console.log(err0)
      }
    })
  })

  app.post('/api/obtainTableData', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const { oldRowsRendered, newRowsRendered, pagination, columns } = req.body, { descending, sortBy } = pagination
        const filter = JSON.parse(req.body.filter)
        const $addFields = {
          matched: {
            $and: filter.reduce((total, elem) => {
              total.push({ $regexMatch: { input: { $toString: `$${elem.label}` }, regex: transformTypeInForRegex(elem.typeIn), options: 'i' } })
              return total
            }, [])
          }
        }
        const aggregateProps = filter.length > 0
          ? [{ $addFields }, { $match: { matched: true } }, { $sort: { _id: -1 } }, { $project: { matched: 0 } }]
          : [{ $match: {} }, { $sort: { _id: -1 } }]
        if (sortBy) {
          const { label } = columns.find(elem => elem.name === sortBy)
          const $sort = { $sort: Object.fromEntries([[label, descending ? -1 : 1]]) }
          aggregateProps.splice(aggregateProps.length - 1, 1, $sort)
        }
        if (newRowsRendered !== 0) aggregateProps.push({ $limit: newRowsRendered }, { $skip: oldRowsRendered })
        client.db('ERP').collection('ProductClassification').aggregate(aggregateProps).toArray((err1, document) => {
          try {
            const tableData = document.map(data => {
              return Object.fromEntries(
                Object.entries(data).map(arr => {
                  if (arr[0] === '_id') return arr
                  arr[0] = columns.find(elem => elem.label === arr[0]).name
                  return arr
                })
              )
            })
            res.send({ tableData })
            client.close()
          } catch (err1) {
            client.close()
            res.end()
            console.log(err1)
          }
        })
      } catch (err0) {
        client.close()
        res.end()
        console.log(err0)
      }
    })
  })

  app.get('/api/filterSelectOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`)
        const select = JSON.parse(getParam(href, 'select')), inputBoxs = JSON.parse(getParam(href, 'inputBoxs')), typeIn = getParam(href, 'typeIn')
        const collection = select.name === 'taxIdNumber' || select.name === 'firm' ? 'firmInform' : 'ProductClassification'
        const input = collection === 'firmInform' ? { $toString: `$firmInform.${select.label}` } : { $toString: `$${select.label}` }
        const $addFields = { matched: { $regexMatch: { input, regex: new RegExp(transformTypeInForRegex(typeIn)), options: 'i' } } }
        const $match = inputBoxs.reduce((total, elem) => {
          const { label, value } = elem
          if ((elem.name === 'taxIdNumber' || elem.name === 'firm') || label === select.label) return total
          return value ? Object.assign(total, Object.fromEntries([[label, value]])) : total
        }, { matched: true })
        const $addToSet = collection === 'firmInform' ? `$firmInform.${select.label}` : `$${select.label}`
        const $group = { _id: null, options: { $addToSet } }, $project = { _id: 0 }
        client.db('ERP').collection(collection).aggregate([{ $addFields }, { $match }, { $group }, { $project }]).toArray((err1, document) => {
          try {
            const options = document.reduce((total, elem) => {
              total.push(...elem.options)
              return total
            }, [])
            res.send({ options })
            client.close()
          } catch (err1) {
            client.close()
            res.end()
            console.log(err1)
          }
        })
      } catch (err0) {
        client.close()
        res.end()
        console.log(err0)
      }
    })
  })

  app.get('/api/obtainControlInputs', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`)
        const inputBoxs = JSON.parse(getParam(href, 'inputBoxs')), targetLabel = getParam(href, 'targetLabel')
        new Promise(resolve => {
          const $match = inputBoxs.reduce((total, elem) => {
            const { label, value } = elem
            if (!value) return total
            return targetLabel === '統編' || targetLabel === '公司名稱'
              ? Object.assign(total, Object.fromEntries([[`firmInform.${label}`, value]]))
              : Object.assign(total, Object.fromEntries([[label, value]]))
          }, {})
          const $group = { _id: null, targetInput: { $first: `$firmInform.${targetLabel}` } }, $project = { _id: 0 }
          client.db('ERP').collection('firmInform').aggregate([{ $match }, { $group }, { $project }]).toArray((err1, document) => {
            try {
              if (document.length > 0) {
                res.send({ targetInput: document[0].targetInput })
                client.close()
              } else {
                if (targetLabel === '種類料號' || targetLabel === '材質料號') {
                  delete $match.統編
                  delete $match.公司名稱
                  resolve($match)
                } else {
                  res.send({ targetInput: null })
                  client.close()
                }
              }
            } catch (err1) {
              client.close()
              res.end()
              console.log(err1)
            }
          })
        }).then($match => {
          const arr$match = Object.entries($match)
          // const input = arr$match.pop(), inputlabel = input[0], inputValue = input[1]
          const input = arr$match.shift(), inputlabel = input[0], inputValue = input[1]
          const $addFields = { matched: { $eq: [`$${inputlabel}`, inputValue] } }
          const $project = Object.fromEntries([['_id', 0], [targetLabel, 1]])
          const $group = Object.assign({ _id: null }, Object.fromEntries([[targetLabel, { $addToSet: { matched: '$matched', value: `$${targetLabel}` } }]]))
          $match = Object.fromEntries(arr$match)
          if (targetLabel === '材質料號') return { $match, $addFields, $group, $project }
          client.db('ERP').collection('ProductClassification').aggregate([{ $addFields }, { $group }, { $project }]).toArray((err1, document) => {
            try {
              // response(document, targetLabel)
              res.send(response(document, targetLabel, inputlabel, inputValue))
              client.close()
            } catch (err1) {
              client.close()
              res.end()
              console.log(err1)
            }
          })
          return new Promise(() => {})
        }).then(props => {
          const { $match, $addFields, $group, $project } = props
          client.db('ERP').collection('ProductClassification').aggregate([{ $match }, { $addFields }, { $group }, { $project }]).toArray((err1, document) => {
            try {
              // response(document, targetLabel)
              res.send(response(document, targetLabel))
              client.close()
            } catch (err1) {
              client.close()
              res.end()
              console.log(err1)
            }
          })
        })
      } catch (err0) {
        client.close()
        res.end()
        console.log(err0)
      }
    })
    function response (document, targetLabel, inputlabel, inputValue) {
      // if (inputlabel === '產品種類' && inputValue === '其他費用') return { targetInput: 'K900' }
      if (inputlabel === '產品種類') {
        if (inputValue === '其他費用') return { targetInput: 'K900' }
        if (inputValue === '其他收入') return { targetInput: 'K901' }
      }
      if (document.length === 0) {
        // res.send({ targetInput: targetLabel === '種類料號' ? 'K000' : '00' })
        if (targetLabel === '種類料號') return { targetInput: 'K000' }
        if (targetLabel === '材質料號') return { targetInput: '00' }
      } else {
        const index = document[0][targetLabel].findIndex(elem => elem.matched)
        if (index > -1) {
          // res.send({ targetInput: document[0][targetLabel][index].value })
          return { targetInput: document[0][targetLabel][index].value }
        } else {
          // res.send({ targetInput: newSerialNumber(document[0][targetLabel], targetLabel) })
          return { targetInput: newSerialNumber(document[0][targetLabel], targetLabel) }
        }
      }
    }

    function newSerialNumber (document, targetLabel) {
      const serialNumbers = document.map(elem => Number(elem.value.match(/\d{2,3}/)[0]))
      const ascendingSerialNumber = serialNumbers.sort((x, y) => x - y)
      let newSerialNumber = null
      for (let i = 0; i < ascendingSerialNumber.length; i++) {
        if (ascendingSerialNumber[i] !== i) {
          newSerialNumber = String(i)
          break
        } else if (i === ascendingSerialNumber.length - 1) {
          newSerialNumber = String(i + 1)
        }
      }
      return targetLabel === '種類料號'
        ? `K${reformNewSerialNumber(targetLabel, newSerialNumber)}`
        : reformNewSerialNumber(targetLabel, newSerialNumber)
    }
    function reformNewSerialNumber (targetLabel, newSerialNumber) {
      const serialNumberLength = targetLabel === '種類料號' ? 3 : 2
      for (let i = newSerialNumber.length; i < serialNumberLength; i++) {
        newSerialNumber = '0' + newSerialNumber
      }
      return newSerialNumber
    }
  })

  app.post('/api/createProductClass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { inputBoxs } = req.body
        new Promise(resolve => {
          const $match = inputBoxs.reduce((total, elem) => {
            return Object.assign(total, Object.fromEntries([[elem.label, elem.value]]))
          }, {})
          client.db('ERP').collection('ProductClassification').aggregate([{ $match }, { $project: { _id: 1 } }]).toArray((err1, document) => {
            try {
              if (document.length === 0) {
                resolve()
              } else {
                res.send({ type: 'negative', message: '所輸入資料已存在' })
                client.close()
              }
            } catch (err1) {
              client.close()
              res.end()
              console.log(err1)
            }
          })
        }).then(async () => {
          const id = new ObjectID()
          const field = inputBoxs.reduce((total, elem) => {
            const { label, value } = elem
            return value ? Object.assign(total, Object.fromEntries([[label, value]])) : total
          }, { _id: id })
          await client.db('ERP').collection('ProductClassification').insertOne(field)
          res.send({ id, type: 'positive', message: '新增成功' })
          client.close()
        })
      } catch (err0) {
        client.close()
        res.end()
        console.log(err0)
      }
    })
  })

  app.post('/api/updateProductClass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const { id, controlInputs } = req.body
        const field = controlInputs.reduce((total, elem) => {
          return Object.assign(total, Object.fromEntries([[elem.label, elem.value]]))
        }, {})
        res.end()
        await client.db('ERP').collection('ProductClassification').updateOne({ _id: new ObjectID(id) }, { $set: field })
        client.close()
      } catch (err0) {
        client.close()
        res.end()
        console.log(err0)
      }
    })
  })

  app.get('/api/deleteProductClass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`), id = getParam(href, 'id')
        await client.db('ERP').collection('ProductClassification').deleteOne({ _id: new ObjectID(id) })
        res.end()
        client.close()
      } catch (err0) {
        client.close()
        res.end()
        console.log(err0)
      }
    })
  })

  // http.listen(port, function () {
  //   console.log('listening on *:3008')
  // })
}
