// import { numberWithCommas } from '../../method/numberWithCommas.js'
// import { roundToTwo } from '../../method/roundToTwo.js'

// export function invoiceRecordBackend () {
module.exports = function () {
  const express = require('express')
  const ExcelJS = require('exceljs')
  const app = express()
  // const http = require('http').Server(app)
  const http = require('http')
  const server = http.createServer(app)
  // var io = require('socket.io')(http, {
  var io = require('socket.io')(server, {
    allowEIO3: true,
    cors: {
      origin: 'http://localhost:8080',
      methods: ['GET', 'POST'],
      allowedHeaders: ['*'],
      credentials: true
    }
  })
  // const port = 3005
  app.set('port', process.env.PORT || 3005)
  const mongodb = require('mongodb')
  const MongoClient = mongodb.MongoClient
  const ObjectId = mongodb.ObjectId
  const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const roundToTwo = (number) => Math.round(number * 100) / 100

  app.use(express.json())
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST')
    res.header('Access-Control-Allow-Headers', '*')
    next()
  })

  server.listen(app.get('port'), function () {
    console.log('listening on *:3005')
  })

  app.post('/api/initializeForRecord', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('materialsInform').aggregate([{ $project: { _id: 0, 統編: 1, 公司名稱: 1 } }]).toArray((err1, document) => {
          if (!err1) {
            const data = {
              taxIdNums: [...new Set(document.map(elem => { return elem.統編 }))],
              firmName: [...new Set(document.map(elem => { return elem.公司名稱 }))]
            }
            res.send(data)
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

  app.post('/api/readInvoiceRecord', function (req, res) {
    const { selectedPeriodName, searchItem } = req.body, { customDate, accountingPeriod, purchaseSalesSelected } = searchItem
    if (!selectedPeriodName && Object.keys(searchItem).length === 3) {
      res.end()
      return
    }
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        client.close()
        console.error(err0)
        return
      }

      const generalTableData = []
      const fieldKeys = ['進銷項', '期年', '期數', '公司名稱', '發票號', '時間', '統編', '複價', '稅金', '發票種類', '備註']
      const $group = fieldKeys.reduce((total, elem) => {
        return Object.assign(total, Object.fromEntries([[elem, { $push: `$${elem}` }]]))
      }, { _id: null })
      const $match = {}, $addFields = {}, $project = { _id: 0 }, aggregateProps = [{ $match }, { $group }, { $project }]
      // const $match = {}, $addFields = {}, $project = { _id: 0 }, aggregateProps = [{ $match }]
      const verify = (item) => {
        $match[item] = true
        $project[item] = 0
      }

      for (const item in searchItem) {
        if (item === 'customDate' || item === 'accountingPeriod') {
          if (selectedPeriodName === 'customDate') {
            $addFields.customDateMatch = { $in: ['$時間', customDate] }
            verify('customDateMatch')
          } else if (selectedPeriodName === 'accountingPeriod') {
            const { yearOfROC, months } = accountingPeriod
            Object.assign($match, { 期年: String(Number(yearOfROC) + 1911), 期數: months })
          }
        } else if (item === 'purchaseSalesSelected') {
          if (purchaseSalesSelected.value !== 'all') $match.進銷項 = purchaseSalesSelected.label
        } else {
          const { label, value } = searchItem[item]
          $addFields.searchTypeInMatch = { $regexMatch: { input: { $toString: `$${label}` }, regex: value, options: 'i' } }
          verify('searchTypeInMatch')
        }
      }
      if (Object.keys($addFields).length > 0) aggregateProps.unshift({ $addFields })
      client.db('ERP').collection('invoiceRecord').aggregate(aggregateProps).toArray((err1, document) => {
        if (err1) {
          client.close()
          console.error(err1)
          return
        }
        client.close()
        if (document.length > 0) {
          const field = document[0], invoiceNumbers = field.發票號, unitInvoiceNumbers = [...new Set(invoiceNumbers)]
          class GeneralTableData {
            constructor (field) {
              this.purchaseSalesItem = field.進銷項
              this.year = field.期年
              this.months = field.期數
              this.firm = field.公司名稱
              this.invoiceNumber = field.發票號
              this.date = field.時間
              this.taxIdNumbers = field.統編
              this.salesFigures = roundToTwo(field.銷售額)
              // this.tax = field.銷售額 < 500 ? '0' : String(roundToTwo(field.銷售額 * 0.05))
              this.tax = field.稅金
              // this.summary = field.銷售額 < 500 ? String(roundToTwo(field.銷售額)) : String(roundToTwo(field.銷售額 * 1.05))
              // this.summary = field.銷售額 < 500 ? String(roundToTwo(field.銷售額)) : String(roundToTwo(Number(field.銷售額) + Number(field.稅金)))
              this.summary = String(roundToTwo(Number(field.銷售額) + Number(field.稅金)))
              this.invoiceType = field.發票種類
              this.remark = field.備註
            }
          }
          unitInvoiceNumbers.forEach(unitNumber => {
            const dataItem = {}
            const unitInvoiceNumberIndex = invoiceNumbers.indexOf(unitNumber)
            for (const label in field) {
              if (label !== '複價') dataItem[label] = field[label][unitInvoiceNumberIndex]
            }
            invoiceNumbers.forEach((number, index) => {
              if (unitNumber === number) dataItem.銷售額 = String(dataItem.銷售額 ? Number(dataItem.銷售額) + Math.round(Number(field.複價[index])) : Math.round(Number(field.複價[index])))
            })
            generalTableData.push(new GeneralTableData(dataItem))
          })
        }
        res.send({ generalTableData })
      })
    })
  })

  app.post('/api/deleteInvoiceRecord', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      if (err0) {
        client.close()
        console.error(err0)
        return
      }

      const { generalDataItemSelected } = req.body
      const arrInvoiceNumber = generalDataItemSelected.map(elem => elem.invoiceNumber)
      await client.db('ERP').collection('invoiceRecord').deleteMany({ 發票號: { $in: arrInvoiceNumber } })
      res.end()
      client.close()
    })
  })

  app.post('/api/readInvoiceDetaill', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { generalDataItemSelected, invoiceDetaillTableColumns } = req.body, { invoiceNumber, purchaseSalesItem } = generalDataItemSelected
        const $project = {}, $match = { 發票號: invoiceNumber, 進銷項: purchaseSalesItem }
        invoiceDetaillTableColumns.forEach(elem => {
          Object.assign($project, Object.fromEntries([[elem.label, 1]]))
        })
        client.db('ERP').collection('invoiceRecord').aggregate([{ $match }, { $project }]).toArray((err1, document) => {
          try {
            const invoiceDetaillData = []
            document.forEach(field => {
              const data = invoiceDetaillTableColumns.reduce((total, elem) => {
                return Object.assign(total, Object.fromEntries([[elem.name, field[elem.label]]]))
              }, { _id: field._id })
              invoiceDetaillData.push(data)
            })
            res.send({ invoiceDetaillData })
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

  app.post('/api/updateInvoiceDetaill', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { invoiceDetaillSelected } = req.body, _id = invoiceDetaillSelected[0]._id
        client.db('ERP').collection('invoiceRecord').aggregate([{ $match: { _id: new ObjectId(_id) } }]).toArray((err1, document) => {
          try {
            res.send({ document })
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

  app.post('/api/deleteInvoiceDetaill', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const { invoiceDetaillSelected } = req.body
        const _idInvoiceDetaill = invoiceDetaillSelected.map(elem => new ObjectId(elem._id))
        await client.db('ERP').collection('invoiceRecord').deleteMany({ _id: { $in: _idInvoiceDetaill } })
        res.end()
        client.close()
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  app.post('/api/updateInvoiceRecord', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const { _id, firstPage, secondPage } = req.body.invoiceRecord, { 單價, 數量 } = secondPage
        delete firstPage.blank
        secondPage.複價 = String(單價 * 數量)
        const invoiceRecord = Object.assign(firstPage, secondPage)
        await client.db('ERP').collection('invoiceRecord').updateMany({ _id: new ObjectId(_id) }, { $set: invoiceRecord })
        res.end()
        client.close()
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  app.post('/api/getFirmInformOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { label, typeInValue } = req.body
        const $addFields = { display: { $regexMatch: { input: { $toString: `$firmInform.${label}` }, regex: typeInValue, options: 'i' } } }
        const $match = { display: true }
        const $project = { _id: 0, 'firmInform.統編': 1, 'firmInform.公司名稱': 1 }
        client.db('ERP').collection('firmInform').aggregate([{ $addFields }, { $match }, { $project }]).toArray((err1, document) => {
          try {
            res.send({ firmInformOptions: document.map(elem => elem.firmInform) })
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

  app.post('/api/getPermissionForNextStep', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        // const { taxIdNumber, invoiceNumber } = req.body
        const { invoiceNumber } = req.body
        // new Promise((resolve) => {
        const $match = Object.fromEntries([[invoiceNumber.label, invoiceNumber.value]])
        client.db('ERP').collection('invoiceRecord').aggregate(([{ $match }, { $count: 'invoiceNumberCount' }])).toArray((err1, document) => {
          try {
            // resolve(document.length > 0)
            res.send({ hasInvoiceNumberExisted: document[0].invoiceNumberCount > 0 })
            client.close()
          } catch (err1) {
            res.end()
            client.close()
            console.error(err1)
          }
        })
        // }).then((hasInvoiceNumberExisted) => {
        //   const $match = Object.fromEntries([[taxIdNumber.label, taxIdNumber.value], ['進銷項', '進項']]), $project = { _id: 0, 產品名稱: 1 }
        //   client.db('ERP').collection('materialsList').aggregate([{ $match }, { $project }]).toArray((err1, document) => {
        //     try {
        //       res.send({
        //         hasInvoiceNumberExisted,
        //         productNameOptions: document.map(elem => elem.產品名稱)
        //       })
        //       client.close()
        //     } catch (err1) {
        //       res.end()
        //       client.close()
        //       console.error(err1)
        //     }
        //   })
        // })
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  app.post('/api/getProductNameOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { firm, productClass } = req.body
        const $match = Object.fromEntries([[firm.label, firm.value], [productClass.label, productClass.value]])
        // client.db('ERP').collection('ProductClassification').aggregate([{ $match }, { $project: { _id: 0, 產品名稱: 1 } }]).toArray((err1, document) => {
        client.db('ERP').collection('materialsInform').aggregate([{ $match }, { $project: { _id: 0, 產品名稱: 1 } }]).toArray((err1, document) => {
          try {
            res.send({ productNameOptions: document.map(elem => elem.產品名稱) })
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

  app.post('/api/getModelOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { productName, taxIdNumber } = req.body
        const $match = Object.assign({ 進銷項: '進項' }, Object.fromEntries([[taxIdNumber.label, taxIdNumber.value], [productName.label, productName.value]]))
        client.db('ERP').collection('materialsList').aggregate([{ $match }, { $project: { _id: 0, 型號: 1 } }]).toArray((err1, document) => {
          try {
            res.send({ modelOptions: [...new Set(document.map(elem => elem.型號))] })
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

  app.post('/api/getUnitPriceAndProjectCodeOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { model, productName, taxIdNumber } = req.body
        const $match = Object.fromEntries([[taxIdNumber.label, taxIdNumber.value], [productName.label, productName.value], [model.label, model.value]])
        client.db('ERP').collection('materialsList').aggregate([{ $match }, { $project: { _id: 0, 單價: 1, 'Project code': 1 } }]).toArray((err1, document) => {
          try {
            const unitPriceOptions = [], projectCodeOptions = []
            document.forEach(elem => {
              unitPriceOptions.push(elem.單價)
              projectCodeOptions.push(elem['Project code'])
            })
            res.send({ unitPriceOptions, projectCodeOptions })
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

  app.post('/api/submitPurchaseRecord', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const convertFormat = (name, purchaseRecord) => {
          req.body[name] = Object.values(purchaseRecord).reduce((total, elem) => {
            return Object.assign(total, Object.fromEntries([[elem.label, elem.value]]))
          }, {})
        }
        for (const purchaseRecord in req.body) {
          convertFormat(purchaseRecord, req.body[purchaseRecord])
        }
        const { inputsOnBaseOfPurchseRecord, inputsOnDetailOfPurchseRecord } = req.body
        const purchaseRecord = { ...{ 進銷項: '進項' }, ...inputsOnBaseOfPurchseRecord, ...inputsOnDetailOfPurchseRecord }, { 單價, 數量 } = purchaseRecord
        purchaseRecord.複價 = String(單價 * 數量)
        new Promise((resolve) => {
          const { 產品名稱, 統編 } = purchaseRecord, $match = { 產品名稱, 統編 }, $project = { _id: 0, 產品種類: 1 }
          client.db('ERP').collection('materialsInform').aggregate([{ $match }, { $project }]).toArray((err1, document) => {
            try {
              resolve(document[0])
            } catch (err1) {
              res.end()
              client.close()
              console.error(err1)
            }
          })
        }).then(async productClass => {
          Object.assign(purchaseRecord, productClass)
          await client.db('ERP').collection('invoiceRecord').insertOne(purchaseRecord)
          res.end()
          client.close()
        })
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  app.post('/api/getSerialNumberOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { serialNumberTypeIn } = req.body
        const $match = { serialNumberMatched: true, 'sheetInform.sheetName.value': '報價單' }
        const $project = { _id: 0, 'sheetInform.serialNumber.value': 1 }
        const $addFields = {
          serialNumberMatched: {
            $regexMatch: { input: { $toString: '$sheetInform.serialNumber.value' }, regex: serialNumberTypeIn, options: 'i' }
          }
        }
        client.db('ERP').collection('basicInformForBomSheet2').aggregate([{ $unwind: '$sheetInform' }, { $addFields }, { $match }, { $project }]).toArray((err1, document) => {
          try {
            const serialNumberOptions = document.reduce((total, elem) => {
              return total.concat(elem.sheetInform.serialNumber.value)
            }, [])
            res.send({ serialNumberOptions })
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

  app.post('/api/getDataOfQuotation', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const salesInvoiceRecords = []
        const result = {}
        const { serialNumber, invoiceNumber } = req.body
        new Promise((resolve) => {
          const $match = Object.fromEntries([[invoiceNumber.label, invoiceNumber.value]])
          client.db('ERP').collection('invoiceRecord').aggregate([{ $match }, { $project: { _id: 1 } }]).toArray((err1, document) => {
            try {
              result.hasInvoiceNumberExisted = document.length > 0
              resolve(result)
            } catch (error) {
              res.end()
              client.close()
              console.error(err1)
            }
          })
        }).then(result => {
          const $match = { 'sheetInform.serialNumber.value': serialNumber }
          const $project = { _id: 0, taxIdNumber: 1, client: 1, 'sheetInform._idTableData': 1, 'sheetInform.projectCode': 1, 'sheetInform.cost': 1 }
          return new Promise((resolve) => {
            client.db('ERP').collection('basicInformForBomSheet2').aggregate([{ $unwind: '$sheetInform' }, { $match }, { $project }]).toArray((err1, document) => {
              try {
                const { client, sheetInform, taxIdNumber } = document[0], { cost, projectCode, _idTableData } = sheetInform
                cost.forEach(elem => {
                  elem.costItem.forEach(item => {
                    salesInvoiceRecords.push({ 公司名稱: client.value, 統編: taxIdNumber.value })
                    const salesInvoiceRecord = salesInvoiceRecords[salesInvoiceRecords.length - 1]
                    salesInvoiceRecord[projectCode.label] = projectCode.value
                    salesInvoiceRecord.產品種類 = elem.costClass === '運費' ? '其他費用' : elem.costClass
                    salesInvoiceRecord.產品名稱 = item
                  })
                })
                result._idTableData = _idTableData
                resolve(result)
              } catch (err1) {
                res.end()
                client.close()
                console.error(err1)
              }
            })
          })
        }).then(result => {
          const { hasInvoiceNumberExisted, _idTableData } = result
          client.db('ERP').collection('bomData').aggregate([{ $match: { _id: _idTableData } }, { $project: { _id: 0, data: 1 } }, { $unwind: '$data' }]).toArray((err1, document) => {
            try {
              salesInvoiceRecords.forEach(record => {
                const { data } = document.slice(8, document.length - 1).find(elem => elem.data.column1 === record.產品名稱)
                record.型號 = data.column2
                record.數量 = data.column3
                record.單價 = data.column5
                record.複價 = data.column6
                record.備註 = data.column7
              })
              res.send({ hasInvoiceNumberExisted, document, salesInvoiceRecords })
              client.close()
            } catch (err1) {
              res.end()
              client.close()
              console.error(err1)
            }
          })
        })
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  app.post('/api/insertSalesInvoiceRecords', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const { salesInvoiceRecords, invoiceNumber } = req.body
        const $match = Object.fromEntries([[invoiceNumber.label, invoiceNumber.value]])
        client.db('ERP').collection('invoiceRecord').aggregate([{ $project: { _id: 0 } }, { $match }]).toArray(async (err1, document) => {
          try {
            if (document.length === 0) {
              new Promise(resolve => {
                const $or = salesInvoiceRecords.reduce((total, elem) => {
                  const $and = []
                  const labelsRequired = elem.產品種類 === '管材' ? ['產品種類', '產品名稱', '型號'] : ['產品種類', '產品名稱']
                  for (const label in elem) {
                    if (labelsRequired.includes(label)) {
                      $and.push({ $eq: [`$${label}`, elem[label]] })
                    }
                  }
                  return [...total, { $and }]
                }, [])
                const $addFields = { matched: { $or } }
                const $project = { _id: 0, 產品材質: 1, 產品名稱: 1, 型號: 1, 產品料號: 1 }
                client.db('ERP').collection('materialsInform').aggregate([{ $addFields }, { $match: { matched: true } }, { $project }]).toArray(async (err1, document) => {
                  try {
                    document.forEach(field => {
                      const record = salesInvoiceRecords.find(elem => {
                        return elem.產品種類 === '管材' ? elem.型號 === field.型號 : elem.產品名稱 === field.產品名稱
                      })
                      record.產品料號 = field.產品料號
                      record.產品材質 = field.產品材質
                      record.稅金 = String(Math.floor(record.複價 * 0.05))
                    })
                    await client.db('ERP').collection('invoiceRecord').insertMany(salesInvoiceRecords)
                    res.end()
                    client.close()
                  } catch (err1) {
                    res.end()
                    client.close()
                    console.error(err1)
                  }
                })
              })
            } else {
              const lostSalesInvoiceRecords = salesInvoiceRecords.filter(record => {
                return !document.some(field => {
                  return Object.keys(record).every(label => {
                    return record[label] === field[label]
                  })
                })
              })
              if (lostSalesInvoiceRecords.length === 0) {
                res.end()
                client.close()
              } else {
                lostSalesInvoiceRecords.forEach(async (elem, index, arr) => {
                  elem.複價 = String(elem.單價 * elem.數量)
                  elem.稅金 = String(Math.floor(elem.複價 * 0.05))
                  await client.db('ERP').collection('invoiceRecord').updateOne(
                    Object.assign({ 產品名稱: elem.產品名稱, 型號: elem.型號 }, $match),
                    { $set: elem }
                  )
                  if (index === arr.length - 1) {
                    res.end()
                    client.close()
                  }
                })
              }
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

  app.post('/api/getRemainderOfProduct', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { productName, model } = req.body
        const $match = model.value
          ? Object.fromEntries([[productName.label, productName.value], [model.label, model.value]])
          : Object.fromEntries([[productName.label, productName.value]])
        const $group = { _id: '$進銷項', count: { $sum: 1 } }
        client.db('ERP').collection('invoiceRecord').aggregate([{ $match }, { $group }]).toArray((err1, document) => {
          try {
            const purchase = document.find(elem => elem._id === '進項'), purchaseAmount = purchase ? purchase.count : 0
            const sales = document.find(elem => elem._id === '銷項'), salesAmount = sales ? sales.count : 0
            res.send({ remainder: purchaseAmount - salesAmount })
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

  app.post('/api/exportInvoiceSheet', function (req, res) {
    const { generalTableData } = req.body
    const workbook = new ExcelJS.Workbook()
    const sheetLables = ['進貨發票稅額500元以上', '進貨發票稅額500元以下', '其他費用-稅額500元以下', '交通費', '銷貨發票', '營業稅估算']
    sheetLables.forEach(sheetLabel => workbook.addWorksheet(sheetLabel))
    const worksheets = {
      purchaseInvoicesAboveFiveHundredTwd: workbook.getWorksheet('進貨發票稅額500元以上'),
      purchaseInvoicesUnderFiveHundredTwd: workbook.getWorksheet('進貨發票稅額500元以下'),
      otherExpenses: workbook.getWorksheet('其他費用-稅額500元以下'),
      trafficExpenses: workbook.getWorksheet('交通費'),
      salesInvoices: workbook.getWorksheet('銷貨發票'),
      salesTax: workbook.getWorksheet('營業稅估算')
    }
    const columns = [
      { header: '業主', key: 'firm' },
      { header: '項目', key: 'item' },
      { header: '發票號碼', key: 'invoiceNumber' },
      { header: '日期mmdd', key: 'date' },
      { header: '稅別/項目', key: 'invoiceType' },
      { header: '統編', key: 'taxIdNumbers' },
      { header: '銷售額', key: 'salesFigures' },
      { header: '稅額', key: 'tax' },
      { header: '總額', key: 'summary' },
      { header: '種類', key: 'category' },
      { header: '備註', key: 'remark' }
    ]
    // create columns
    Object.values(worksheets).forEach((worksheet, index, arr) => {
      // if (index < arr.length - 1) worksheet.columns = structuredClone(columns)
      if (index < arr.length - 1) worksheet.columns = JSON.parse(JSON.stringify(columns))
    })
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const invoiceNumbers = generalTableData.reduce((total, tableData) => {
          return total.includes(tableData.invoiceNumber) ? total : [...total, tableData.invoiceNumber]
        }, [])
        const $addFields = { matched: { $and: [{ $in: ['$發票號', invoiceNumbers] }, { $eq: ['$產品種類', '其他費用'] }] } }
        const $group = { _id: '$產品材質', invoiceNumbers: { $addToSet: '$發票號' } }
        client.db('ERP').collection('invoiceRecord').aggregate([{ $addFields }, { $match: { matched: true } }, { $group }]).toArray(async (err1, document) => {
          try {
            const findColumnIndex = (columnKey) => columns.findIndex(column => column.key === columnKey)
            const trafficExpensesInvoiceNumbers = document.find(elem => elem._id === '交通').invoiceNumbers
            const otherExpensesInvoiceNumbers = document.reduce((total, elem) => {
              return elem._id === '交通' ? total : [...total, ...elem.invoiceNumbers]
            }, [])
            const createRowData = (tableData) => columns.reduce((total, column) => {
              return column.key === 'item' || column.key === 'category'
                ? total
                : Object.assign(total, Object.fromEntries([[column.key, tableData[column.key]]]))
            }, { item: null, category: null })
            // add row
            generalTableData.forEach(tableData => {
              const { purchaseSalesItem, invoiceNumber, tax } = tableData
              if (purchaseSalesItem === '銷項') {
                worksheets.salesInvoices.addRow(createRowData(tableData))
              } else if (trafficExpensesInvoiceNumbers.includes(invoiceNumber)) {
                worksheets.trafficExpenses.addRow(createRowData(tableData))
              } else if (otherExpensesInvoiceNumbers.includes(invoiceNumber) && tax < 500) {
                worksheets.otherExpenses.addRow(createRowData(tableData))
              } else if (tax < 500) {
                worksheets.purchaseInvoicesUnderFiveHundredTwd.addRow(createRowData(tableData))
              } else if (tax >= 500) {
                worksheets.purchaseInvoicesAboveFiveHundredTwd.addRow(createRowData(tableData))
              }
            })
            Object.values(worksheets).forEach((worksheet, index, arr) => {
              if (index < arr.length - 1) {
                // add total amount
                const calculateTotalAmount = (values) => values.slice(2).reduce((total, elem) => {
                  return total + Math.round(Number(elem))
                }, 0)
                const total = {
                  salesFigures: calculateTotalAmount(worksheet.getColumn('salesFigures').values),
                  tax: calculateTotalAmount(worksheet.getColumn('tax').values),
                  summary: calculateTotalAmount(worksheet.getColumn('summary').values)
                }
                worksheet.addRow({ firm: '合計', salesFigures: total.salesFigures, tax: total.tax, summary: total.summary })
                worksheet.getColumn('salesFigures').values = worksheet.getColumn('salesFigures').values.map(value => numberWithCommas(value))
                worksheet.getColumn('tax').values = worksheet.getColumn('tax').values.map(value => numberWithCommas(value))
                worksheet.getColumn('summary').values = worksheet.getColumn('summary').values.map(value => numberWithCommas(value))
                // set stylies
                worksheet.eachRow((row, rowNumber) => {
                  row.font = { name: '微軟正黑體', size: 12 }
                  if (rowNumber > 1) {
                    row.eachCell((cell, colNumber) => {
                      const columnsAlignedRight = [findColumnIndex('item') + 1, findColumnIndex('taxIdNumbers') + 1, findColumnIndex('salesFigures') + 1, findColumnIndex('tax') + 1, findColumnIndex('summary') + 1, findColumnIndex('category') + 1]
                      if (columnsAlignedRight.includes(colNumber)) cell.alignment = { horizontal: 'right' }
                    })
                  }
                })
                worksheet.getRow(1).eachCell((cell) => {
                  cell.font.bold = true
                  cell.border = { bottom: { style: 'double' } }
                  cell.alignment = { horizontal: 'center' }
                })
                worksheet.lastRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                  if (colNumber <= columns.length) {
                    cell.font.bold = true
                    cell.border = { top: { style: 'double' } }
                  }
                })
                worksheet.lastRow.getCell('category').border = { top: { style: 'double' } }
                worksheet.lastRow.getCell('remark').border = { top: { style: 'double' } }
              }
            })
            // export excel file
            // workbook.xlsx.writeFile('/Users/evan/Desktop/workbook.xlsx')
            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
            res.send({
              // 把buffer轉為base64格式
              // Base64是一種用64個字符來表示任意二進制數據的方法。
              // 用記事本打開exe、jpg、pdf這些文件時，我們都會看到一大堆亂碼，
              // 因為二進製文件包含很多無法顯示和打印的字符，所以，如果要讓記事本這樣的文本處理軟件能處理二進制數據，
              // 就需要一個二進製到字符串的轉換方法。Base64是一種最常見的二進制編碼方法。
              bufferExcel: buffer.toString('base64')
            })
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

  app.post('/api/filterProductClass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { typeIn, taxIdNumber } = req.body
        const $match = Object.fromEntries([[taxIdNumber.label, taxIdNumber.value]])
        const $group = { _id: null, options: { $addToSet: '$產品種類' } }, $project = { _id: 0 }
        const props = [{ $match }, { $group }, { $project }]
        if (typeIn) {
          const $addFields = { matched: { $regexMatch: { input: { $toString: '$產品種類' }, regex: typeIn, options: 'i' } } }
          props.unshift({ $addFields  })
          Object.assign($match, { matched: true })
        }
        client.db('ERP').collection('ProductClassification').aggregate(props).toArray((err1, document) => {
          try {
            const options = document.length > 0 ? document[0].options.filter(option => option).slice(0, 5) : []
            res.send({ options })
            client.close() 
          } catch (err1) {
            res.end()
            console.error(err1)
            client.close()
          }
        })
      } catch (err0) {
        res.end()
        console.error(err0)
        client.close()
      }
    })
  })

  app.post('/api/filterProductSubclass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { typeIn, taxIdNumber, productClass } = req.body
        const $match = Object.fromEntries([[taxIdNumber.label, taxIdNumber.value], [productClass.label, productClass.value]])
        const $group = { _id: null, options: { $addToSet: '$產品材質' } }, $project = { _id: 0 }
        const props = [{ $match }, { $group }, { $project }]
        if (typeIn) {
          const $addFields = { matched: { $regexMatch: { input: { $toString: '$產品材質' }, regex: typeIn, options: 'i' } } }
          props.unshift({ $addFields  })
          Object.assign($match, { matched: true })
        }
        client.db('ERP').collection('ProductClassification').aggregate(props).toArray((err1, document) => {
          try {
            const options = document.length > 0 ? document[0].options.filter(option => option).slice(0, 5) : []
            res.send({ options })
            client.close() 
          } catch (err1) {
            res.end()
            console.error(err1)
            client.close()
          }
        })
      } catch (err0) {
        res.end()
        console.error(err0)
        client.close()
      }
    })
  })

  app.post('/api/filterProductName', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { typeIn, taxIdNumber, productClass, productSubclass } = req.body
        const $match = Object.fromEntries([
          [taxIdNumber.label, taxIdNumber.value],
          [productClass.label, productClass.value],
          [productSubclass.label, productSubclass.value]
        ])
        const $group = { _id: null, options: { $addToSet: '$產品名稱' } }, $project = { _id: 0 }
        const props = [{ $match }, { $group }, { $project }]
        if (typeIn) {
          const $addFields = { matched: { $regexMatch: { input: { $toString: '$產品名稱' }, regex: typeIn, options: 'i' } } }
          props.unshift({ $addFields  })
          Object.assign($match, { matched: true })
        }
        client.db('ERP').collection('materialsInform').aggregate(props).toArray((err1, document) => {
          try {
            const options = document.length > 0 ? document[0].options.filter(option => option).slice(0, 5) : []
            res.send({ options })
            client.close() 
          } catch (err1) {
            res.end()
            console.error(err1)
            client.close()
          }
        })
      } catch (err0) {
        res.end()
        console.error(err0)
        client.close()
      }
    })
  })

  app.post('/api/filterModel', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { typeIn, item, productClass, productSubclass } = req.body
        const $addFields = { matched: { $regexMatch: { input: { $toString: `$${item.label}` }, regex: typeIn, options: 'i' } } }
        const $match = Object.fromEntries ([
          ['matched', true], [productClass.label, productClass.value], [productSubclass.label, productSubclass.value]
        ])
        const $group = { _id: null, options: { $addToSet: `$${item.label}` } }, $project = { _id: 0 }
        client.db('ERP').collection('materialsInform').aggregate([{$addFields}, { $match }, { $group }, { $project }]).toArray((err1, document) => {
          try {
            res.send({ options: document.length > 0 ? document[0].options.slice(0, 5) : [] })
            client.close()
          } catch (err1) {
            res.end()
            console.error(err1)
            client.close()
          }
        })
      } catch (err0) {
        res.end()
        console.error(err0)
        client.close()
      }
    })
  })

  io.on('connection', (socket) => {
    socket.on('getProductClassByTaxIdNum', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          // client.db('ERP').collection('ProductClassification').aggregate([{ $match: { 統編: frontendData.taxIdNum } }, { $project: { _id: 0, 產品種類: 1 } }]).toArray((err1, document) => {
          client.db('ERP').collection('materialsInform').aggregate([{ $match: { 統編: frontendData.taxIdNum } }, { $project: { _id: 0, 產品種類: 1 } }]).toArray((err1, document) => {
            if (!err1) {
              const data = {
                productClass: [...new Set(document.map(elem => { return elem.產品種類 }))]
              }
              io.emit('getProductClassByTaxIdNum', data)
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
    socket.on('getFirmNameByProductClass', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          // client.db('ERP').collection('ProductClassification').aggregate([{ $match: { 產品種類: frontendData.productClass } }, { $project: { _id: 0, 產品名稱: 1 } }]).toArray((err1, document) => {
          client.db('ERP').collection('materialsInform').aggregate([{ $match: { 產品種類: frontendData.productClass } }, { $project: { _id: 0, 產品名稱: 1 } }]).toArray((err1, document) => {
            if (!err1) {
              const data = {
                productName: [...new Set(document.map(elem => { return elem.產品名稱 }))]
              }
              io.emit('getFirmNameByProductClass', data)
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
    socket.on('getModelAnd_idByClass', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          client.db('ERP').collection('materialsInform').aggregate([{ $match: { 產品名稱: frontendData.class2 } }, { $project: { 型號: 1 } }]).toArray((err1, document) => {
            if (!err1) {
              const data = {
                model: document.map(elem => { return elem.型號 }),
                materialsInform_id: document.map(elem => { return elem._id })
              }
              io.emit('getModelAnd_idByClass', data)
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
    socket.on('getPricesByMaterialsInform_id', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          const { materialsInform } = frontendData
          client.db('ERP').collection('materialsList').aggregate([{ $match: materialsInform }, { $project: { _id: 0, 單價: 1 } }]).toArray((err1, document) => {
            try {
              const unitPrice = [...new Set(document.map(elem => elem.單價))]
              io.emit('getPricesByMaterialsInform_id', { unitPrice })
              client.close()
            } catch (err1) {
              console.log('Error => ', err0)
              client.close()
            }
          })
        } else {
          console.log('Error => ', err0)
          client.close()
        }
      })
    })
    socket.on('update', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          client.db('ERP').collection('invoiceRecord').aggregate([{ $match: { _id: new mongodb.ObjectID(frontendData.selected._id) } }]).toArray((err2, document) => {
            io.emit('initializeForUpdated', {
              recordData: document[0],
              invoiceNum: frontendData.invoiceNum
            })
            client.close()
          })
        } else {
          console.log('Error => ', err0)
          client.close()
        }
      })
    })
    socket.on('submit', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          if (frontendData.submitOperation === 'create') {
            (async () => {
              const { firstPage, secondPage } = frontendData.invoiceRecord, { 單價, 數量 } = secondPage
              delete firstPage.blank
              secondPage.複價 = String(單價 * 數量)
              // delete secondPage.blank
              const invoiceRecord = { ...firstPage, ...secondPage }
              await client.db('ERP').collection('invoiceRecord').insertOne(invoiceRecord)
              io.emit('submitSucceed', {
                message: '新增成功'
              })
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
      MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          (async () => {
            await client.db('ERP').collection('invoiceRecord').deleteOne({ _id: new mongodb.ObjectID(frontendData.selected[0]._id) })
            io.emit('deleteSucceed', {
              message: '剛除成功'
            })
            console.log('delete succeed')
            client.close()
          })()
        } else {
          console.log('Error => ', err0)
          client.close()
        }
      })
    })
  })

  // http.listen(port, function () {
  //   console.log('listening on *:3005')
  // })
}
