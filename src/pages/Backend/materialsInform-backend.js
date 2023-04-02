// export function materialsInformBackend () {
module.exports = function () {
  const express = require('express')
  const app = express()
  // const http = require('http').Server(app)
  const http = require('http')
  const server = http.createServer(app)
  // const port = 3003
  app.set('port', process.env.PORT || 3003)
  const mongodb = require('mongodb')
  const MongoClient = mongodb.MongoClient
  const ObjectID = mongodb.ObjectID
  const formidable = require('formidable')
  const path = require('path')
  const fs = require('fs')

  const form = new formidable.IncomingForm()
  const folder = path.join(__dirname, 'files')

  app.disable('x-powered-by')
  app.use(express.json())
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST')
    // res.header('Access-Control-Allow-Methods', '*')
    res.header('Access-Control-Allow-Headers', '*')
    next()
  })

  server.listen(app.get('port'), function () {
    console.log('listening on *:3003')
  })

  // app.post('/api/getRowsData', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  //     if (!err0) {
  //       client.db('ERP').collection('materialsInform').aggregate([{ $match: {} }]).toArray((err1, document) => {
  //         if (!err1) {
  //           res.send({
  //             rowsData: document.reverse()
  //           })
  //           client.close()
  //           res.end()
  //         } else {
  //           console.log('Error => ', err1)
  //           client.close()
  //           res.end()
  //         }
  //       })
  //     } else {
  //       console.log('Error => ', err0)
  //       client.close()
  //       res.end()
  //     }
  //   })
  // })

  // app.post('/api/saveMaterialsInform', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  //     try {
  //       const { materialsInformInput } = req.body, { taxIdNumber, material, model } = materialsInformInput
  //       const $match = Object.fromEntries([[taxIdNumber.label, taxIdNumber.value], [material.label, material.value], [model.label, model.value]])
  //       const materialsInform = Object.values(materialsInformInput).reduce((total, elem) => {
  //         return Object.assign(total, Object.fromEntries([[elem.label, elem.value]]))
  //       }, {})
  //       client.db('ERP').collection('materialsInform').aggregate([{ $match }]).toArray(async (err1, document) => {
  //         try {
  //           if (document.length === 0) {
  //             await client.db('ERP').collection('materialsInform').insertOne(materialsInform)
  //             res.send({ success: true, message: '新增成功' })
  //           } else {
  //             res.send({ success: false, message: '材料資料已存在' })
  //           }
  //           client.close()
  //         } catch (err1) {
  //           res.end()
  //           client.close()
  //           console.err(err1)
  //         }
  //       })
  //     } catch (err0) {
  //       res.end()
  //       client.close()
  //       console.err(err0)
  //     }
  //   })
  // })

  app.post('/api/updateMaterialsInform', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const { _id, materialsInform } = req.body
        const document = await materialsInform.reduce((total, elem) => {
          return Object.assign(total, Object.fromEntries([[elem.label, elem.value]]))
        }, {})
        await client.db('ERP').collection('materialsInform').updateOne({ _id: new ObjectID(_id) }, { $set: document })
        res.send({ type: 'positive', message: '更新成功' })
        client.close()
      } catch (err0) {
        res.end()
        client.close()
        console.err(err0)
      }
    })
  })

  app.post('/api/upload', async function (req, res) {
    const url = new URL(req.url, `${req.protocol}://${req.headers.host}/`)
    const partNumber = url.searchParams.get('partNumber')
    if (!fs.existsSync(folder)) await fs.mkdirSync(folder)
    form.uploadDir = folder
    form.parse(req, async (err, fields, files) => {
      const fileName = Object.keys(files)[0]
      fs.renameSync(path.join(folder, files[fileName].newFilename), path.join(folder, partNumber + '.pdf'))
      if (err) {
        return res.status(400).json({
          status: 'Fail',
          message: 'There was an error parsing the files',
          error: err
        })
      }
      res.end()
    })
  })

  app.get('/api/exportPdfFile', function (req, res) {
    const href = new URL(`http://${req.headers.host}${req.url}`), productPartNumber = getParam(href, 'productPartNumber')
    fs.readFile(path.join(folder, `${productPartNumber}.pdf`), async (err, data) => {
      if (err) return res.send({ type: 'negative', message: '下載失敗' })
      const base64Data = await data.toString('base64')
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=${productPartNumber}.pdf`)
      res.send({ type: 'positive', message: '下載成功', base64Data })
    })
  })

  // app.post('/api/downloadMaterialsInformPdf', function (req, res) {
  //   const fileName = req.body.partNumber + '.pdf'
  //   const pdfBuffer = fs.readFileSync(path.join(folder, fileName)).toString('base64')
  //   res.send({ pdfBuffer, fileName })
  // })

  // app.post('/api/getFirmInformOptions', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  //     try {
  //       const { label, typeIn } = req.body
  //       const $addFields = { typeInMatched: { $regexMatch: { input: `$firmInform.${label}`, regex: typeIn, options: 'i' } } }
  //       const $match = { typeInMatched: true }
  //       const $project = { _id: 0, 'firmInform.統編': 1, 'firmInform.公司名稱': 1 }
  //       client.db('ERP').collection('firmInform').aggregate([{ $addFields }, { $match }, { $project }]).toArray((err1, document) => {
  //         try {
  //           res.send({
  //             taxIdNumberOptions: document.map(elem => elem.firmInform.統編),
  //             firmOptions: document.map(elem => elem.firmInform.公司名稱)
  //           })
  //           client.close()
  //         } catch (err1) {
  //           res.end()
  //           client.close()
  //           console.err(err1)
  //         }
  //       })
  //     } catch (err0) {
  //       res.end()
  //       client.close()
  //       console.err(err0)
  //     }
  //   })
  // })

  // app.post('/api/getMaterialOptions', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  //     try {
  //       const { taxIdNumber, firm } = req.body
  //       const $match = Object.fromEntries([[taxIdNumber.label, taxIdNumber.value], [firm.label, firm.value]])
  //       client.db('ERP').collection('ProductClassification').aggregate([{ $match }, { $project: { _id: 0, 產品名稱: 1 } }]).toArray((err1, document) => {
  //         try {
  //           res.send({ materialOptions: document.map(elem => elem.產品名稱) })
  //           client.close()
  //         } catch (err1) {
  //           res.end()
  //           client.close()
  //           console.err(err1)
  //         }
  //       })
  //     } catch (err0) {
  //       res.end()
  //       client.close()
  //       console.err(err0)
  //     }
  //   })
  // })

  // app.post('/api/deleteMaterialsInform', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
  //     try {
  //       const { materialsInformSelected } = req.body
  //       await client.db('ERP').collection('materialsInform').deleteOne({ _id: new mongodb.ObjectID(materialsInformSelected._id) })
  //       fs.unlink(path.join(folder, materialsInformSelected.料號 + '.pdf'), (err) => {
  //         if (err) {
  //           console.error(err)
  //           return res.status(400).json({
  //             status: 'Fail',
  //             message: 'There was an error deleting the directory',
  //             error: err
  //           })
  //         }
  //         res.send({ message: '剛除成功' })
  //       })
  //       client.close()
  //     } catch (err0) {
  //       res.end()
  //       client.close()
  //       console.err(err0)
  //     }
  //   })
  // })

  const getParam = (href, strKey) => href.searchParams.get(strKey)
  const transformTypeInForRegex = (string) => {
    return string.split('').reduce((str, char) => {
      return str.concat(/\W/.test(char) ? `\\${char}` : char)
    }, '')
  }

  app.get('/api/filterOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`)
        const name = getParam(href, 'name'), label = getParam(href, 'label'),
          typeIn = getParam(href, 'typeIn'), hasValueSelects = JSON.parse(getParam(href, 'hasValueSelects'))
        const collection = (() => {
          if (name === 'taxIdNumber' || name === 'firm') return 'firmInform'
          if (name === 'productClass' || name === 'productSubclass') return 'ProductClassification'
          if (name === 'productName') return 'materialsInform'
        })()
        const input = collection === 'firmInform' ? `$firmInform.${label}` : `$${label}`
        const $addFields = { matched: { $regexMatch: { input, regex: { $toString: transformTypeInForRegex(typeIn) }, options: 'i' } } }
        const $match = hasValueSelects.reduce((total, elem) => {
          const { label, value } = elem
          return collection === 'firmInform'
            ? Object.assign(total, Object.fromEntries([[`firmInform.${label}`, value]]))
            : Object.assign(total, Object.fromEntries([[label, value]]))
        }, {})
        const $addToSet = collection === 'firmInform' ? `$firmInform.${label}` : (() => {
          if (name === 'productClass') return { label: `$${label}`, serialNumber: '$種類料號' }
          if (name === 'productSubclass') return { label: `$${label}`, serialNumber: '$材質料號' }
          if (name === 'productName') return { label: `$${label}` }
        })()
        const $group = Object.fromEntries([['_id', null], [label, { $addToSet }]])
        const aggregateProps = name === 'productClass' || name === 'productSubclass'
          ? [{ $match }, { $group }]
          : [{ $addFields }, { $match: Object.assign($match, { matched: true }) }, { $group }]
        client.db('ERP').collection(collection).aggregate(aggregateProps).toArray((err1, document) => {
          try {
            res.send({ options: document.length > 0 ? document[0][label] : [] })
            client.close()
          } catch (err1) {
            console.log(err1)
            client.close()
            res.end()
          }
        })
      } catch (err0) {
        console.log(err0)
        client.close()
        res.end()
      }
    })
  })

  app.get('/api/requestCorrelativeFirmInformValue', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`), select = JSON.parse(getParam(href, 'select'))
        const $match = Object.fromEntries([[`firmInform.${select.label}`, select.value]])
        const $project = { _id: 0, 'firmInform.統編': 1, 'firmInform.公司名稱': 1 }
        client.db('ERP').collection('firmInform').aggregate([{ $project }, { $match }]).toArray((err1, document) => {
          try {
            const { firmInform } = document[0]
            res.send({ firmInform })
            client.close()
          } catch (err1) {
            console.log(err1)
            client.close()
            res.end()
          }
        })
      } catch (err0) {
        console.log(err0)
        client.close()
        res.end()
      }
    })
  })

  app.post('/api/insertMaterialsInform', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const { materialsInform } = req.body
        const findMaterialsInform = (name) => materialsInform.find(elem => elem.name === name)
        const $match = Object.fromEntries([
          [findMaterialsInform('taxIdNumber').label, findMaterialsInform('taxIdNumber').value],
          [findMaterialsInform('firm').label, findMaterialsInform('firm').value],
          [findMaterialsInform('productClass').label, findMaterialsInform('productClass').value],
          [findMaterialsInform('productSubclass').label, findMaterialsInform('productSubclass').value],
          [findMaterialsInform('productName').label, findMaterialsInform('productName').value],
          [findMaterialsInform('model').label, findMaterialsInform('model').value]
        ])
        const $project = { _id: 1 }
        client.db('ERP').collection('materialsInform').aggregate([{ $match }, { $project }]).toArray(async (err1, document) => {
          try {
            if (document.length > 0) {
              res.send({ type: 'negative', message: '材料資料已存在' })
            } else {
              const materialDocumnet = materialsInform.reduce((total, elem) => {
                return Object.assign(total, Object.fromEntries([[elem.label, elem.value]]))
              }, {})
              await client.db('ERP').collection('materialsInform').insertOne(materialDocumnet)
              res.send({ type: 'positive', message: '新增成功' })
            }
            client.close()
          } catch (err1) {
            console.log(err1)
            client.close()
            res.end()
          }
        })
      } catch (err0) {
        console.log(err0)
        client.close()
        res.end()
      }
    })
  })

  // app.get('/api/filterProductName', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  //     try {
  //       const href = new URL(`http://${req.headers.host}${req.url}`)
  //       const productClass = JSON.parse(getParam(href, 'productClass')), productSubclass = JSON.parse(getParam(href, 'productSubclass')),
  //         select = JSON.parse(getParam(href, 'select')), typeIn = getParam(href, 'typeIn')
  //       const $addFields = { matched: { $regexMatch: { input: `$${select.label}`, regex: transformTypeInForRegex(typeIn), options: 'i' } } }
  //       const $match = Object.fromEntries([['matched', true], [productClass.label, productClass.value], [productSubclass.label, productSubclass.value]])
  //       const $group = { _id: null, productFiltered: { $addToSet: { label: '$產品名稱', serialNumber: '$產品名稱流水號' } } }
  //       const $project = { _id: 0 }
  //       client.db('ERP').collection('materialsInform').aggregate([{ $addFields }, { $match }, { $group }, { $project }, { $limit: 5 }]).toArray((err1, document) => {
  //         try {
  //           res.send({ productNamesFiltered: document.length > 0 ? document[0].productFiltered : [] })
  //           client.close()
  //         } catch (err1) {
  //           console.log(err1)
  //           client.close()
  //           res.end()
  //         }
  //       })
  //     } catch (err0) {
  //       console.log(err0)
  //       client.close()
  //       res.end()
  //     }
  //   })
  // })

  // app.post('/api/requestProductNameSerialNumber', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  //     try {
  //       const { model, productClass, productSubclass } = req.body
  //       const $match = Object.fromEntries([[productClass.label, productClass.value], [productSubclass.label, productSubclass.value]])
  //       const $group = { _id: null, productFiltered: { $addToSet: { label: '$產品名稱', serialNumber: '$產品名稱流水號' } } }
  //       const $project = { _id: 0 }
  //       client.db('ERP').collection('materialsInform').aggregate([{ $match }, { $group }, { $project }]).toArray((err1, document) => {
  //         try {
  //           res.send({ productNamesFiltered: [{ label: model.value, serialNumber: document.length > 0 ? newSerialNumber(document[0].productFiltered, 3) : '000' }] })
  //           client.close()
  //         } catch (err1) {
  //           console.log(err1)
  //           client.close()
  //           res.end()
  //         }
  //       })
  //     } catch (err0) {
  //       console.log(err0)
  //       client.close()
  //       res.end()
  //     }
  //   })
  // })

  // app.post('/api/obtainTableData', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  //     try {
  //       const { materialsInform } = req.body
  //       client.db('ERP').collection('materialsInform').aggregate([{ $match: {} }]).toArray((err1, document) => {
  //         try {
  //           const tableData = document.map(data => {
  //             return Object.fromEntries(
  //               Object.entries(data).map(arr => {
  //                 if (arr[0] === '_id') return arr
  //                 arr[0] = materialsInform.find(elem => elem.label === arr[0]).name
  //                 return arr
  //               })
  //             )
  //           })
  //           res.send({ tableData })
  //           client.close()
  //         } catch (err1) {
  //           console.log(err1)
  //           client.close()
  //           res.end()
  //         }
  //       })
  //     } catch (err0) {
  //       console.log(err0)
  //       client.close()
  //       res.end()
  //     }
  //   })
  // })

  app.post('/api/obtainTableData', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { oldRowsRendered, newRowsRendered, pagination, materialsInform } = req.body, { sortBy, descending } = pagination
        let { columns } = req.body
        // const { sortBy } = pagination
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
          columns = JSON.parse(columns)
          // sortBy = columns.find(elem => elem.name === sortBy).label
          const { label } = columns.find(elem => elem.name === sortBy)
          const $sort = { $sort: Object.fromEntries([[label, descending ? -1 : 1]]) }
          aggregateProps.splice(aggregateProps.length - 1, 1, $sort)
        }
        if (newRowsRendered !== 0) aggregateProps.push({ $limit: newRowsRendered }, { $skip: oldRowsRendered })
        client.db('ERP').collection('materialsInform').aggregate(aggregateProps).toArray((err1, document) => {
          try {
            const tableData = document.map(data => {
              return Object.fromEntries(
                Object.entries(data).map(arr => {
                  if (arr[0] === '_id') return arr
                  arr[0] = materialsInform.find(elem => elem.label === arr[0]).name
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
    // function reformTableData (document) {
    //   class TableData {
    //     constructor (data) {
    //       this.id = data._id
    //       this.taxIdNumber = data.統編
    //       this.firm = data.公司名稱
    //       this.productClass = data.產品種類
    //       this.productPartNumber = data.種類料號
    //       this.productSubclass = data.產品材質
    //       this.productSubclassPartNumber = data.材質料號
    //     }
    //   }
    //   document.forEach((elem, index, arr) => {
    //     arr[index] = new TableData(elem)
    //   })
    //   return document
    // }
  })

  // app.post('/api/filterCaliber', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  //     try {
  //       const { typeIn, productSubclass } = req.body
  //       const $addFields = { matched: { $regexMatch: { input: '$管材口徑', regex: transformTypeInForRegex(typeIn), options: 'i' } } }
  //       // const $match = { matched: true, 產品材質: productSubclass }
  //       const $match = Object.assign({ matched: true }, Object.fromEntries([[productSubclass.label, productSubclass.value]]))
  //       const $group = { _id: null, calibersFiltered: { $addToSet: { label: '$管材口徑', serialNumber: '$管材口徑流水號' } } }
  //       const $project = { _id: 0 }
  //       client.db('ERP').collection('materialsInform').aggregate([{ $addFields }, { $match }, { $group }, { $project }]).toArray((err1, document) => {
  //         try {
  //           res.send({ caliberOptionsFiltered: document.length > 0 ? document[0].calibersFiltered.slice(0, 5) : [] })
  //           client.close()
  //         } catch (err1) {
  //           console.log(err1)
  //           client.close()
  //           res.end()
  //         }
  //       })
  //     } catch (err0) {
  //       console.log(err0)
  //       client.close()
  //       res.end()
  //     }
  //   })
  // })

  // app.post('/api/filterThickness', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  //     try {
  //       const { typeIn, caliber } = req.body
  //       const $addFields = { matched: { $regexMatch: { input: '$管材厚度', regex: transformTypeInForRegex(typeIn), options: 'i' } } }
  //       const $match = Object.assign({ matched: true, 產品材質: '方管' }, Object.fromEntries([[caliber.label, caliber.value]]))
  //       const $group = { _id: null, thicknessFiltered: { $addToSet: { label: '$管材厚度', serialNumber: '$管材厚度流水號' } } }
  //       const $project = { _id: 0 }
  //       client.db('ERP').collection('materialsInform').aggregate([{ $addFields }, { $match }, { $group }, { $project }]).toArray((err1, document) => {
  //         try {
  //           console.log('document[0].thicknessFiltered')
  //           console.log(document[0].thicknessFiltered)
  //           res.send({ thicknessOptionsFiltered: document.length > 0 ? document[0].thicknessFiltered.slice(0, 5) : [] })
  //           client.close()
  //         } catch (err1) {
  //           console.log(err1)
  //           client.close()
  //           res.end()
  //         }
  //       })
  //     } catch (err0) {
  //       console.log(err0)
  //       client.close()
  //       res.end()
  //     }
  //   })
  // })

  app.post('/api/requestCaliberSerialNumber', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        // const { caliber, productClass, productSubclass, caliberLabels } = req.body
        const { caliber, productClass, productSubclass, serialNumberLengthRequired } = req.body
        // const $addFields = { matched: { $not: [{ $in: ['$管材口徑', caliberLabels] }] } }
        // const $match = Object.fromEntries([['matched', true], [productClass.label, productClass.value], [productSubclass.label, productSubclass.value]])
        const $match = Object.fromEntries([[productClass.label, productClass.value], [productSubclass.label, productSubclass.value]])
        const $group = { _id: null, calibersFiltered: { $addToSet: { label: '$管材口徑', serialNumber: '$管材口徑流水號' } } }
        client.db('ERP').collection('materialsInform').aggregate([{ $match }, { $group }]).toArray((err1, document) => {
          try {
            res.send({ inputWithSerialNumber: { label: caliber.value, serialNumber: document.length > 0 ? newSerialNumber(document[0].calibersFiltered, serialNumberLengthRequired) : '00' } })
            client.close()
          } catch (err1) {
            console.log(err0)
            client.close()
            res.end()
          }
        })
      } catch (err0) {
        console.log(err0)
        client.close()
        res.end()
      }
    })
  })

  app.post('/api/requestThicknessSerialNumber', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { thickness, productSubclass, caliber, serialNumberLengthRequired } = req.body
        const $match = Object.fromEntries([[productSubclass.label, productSubclass.value], [caliber.label, caliber.value]])
        const $group = { _id: null, thicknessFiltered: { $addToSet: { label: '$管材厚度', serialNumber: '$管材厚度流水號' } } }
        client.db('ERP').collection('materialsInform').aggregate([{ $match }, { $group }]).toArray((err1, document) => {
          try {
            res.send({ inputWithSerialNumber: { label: thickness.value, serialNumber: document.length > 0 ? newSerialNumber(document[0].thicknessFiltered, serialNumberLengthRequired) : '0' } })
            client.close()
          } catch (err1) {
            console.log(err1)
            client.close()
            res.end()
          }
        })
      } catch (err0) {
        console.log(err0)
        client.close()
        res.end()
      }
    })
  })

  app.post('/api/requestPipeMaterialNameSerialNumber', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { pipeMaterialName, thickness, productSubclass, caliber, serialNumberLengthRequired } = req.body
        const $match = Object.fromEntries([[productSubclass.label, productSubclass.value], [caliber.label, caliber.value], [thickness.label, thickness.value]])
        const $group = { _id: null, thicknessFiltered: { $addToSet: { label: '$管材名稱', serialNumber: '$管材名稱流水號' } } }
        client.db('ERP').collection('materialsInform').aggregate([{ $match }, { $group }]).toArray((err1, document) => {
          try {
            res.send({
              inputWithSerialNumber: {
                label: pipeMaterialName.value,
                serialNumber: document.length > 0
                  ? newSerialNumber(document[0].thicknessFiltered, serialNumberLengthRequired)
                  : productSubclass.value === '方管' ? '00' : '000'
              }
            })
            client.close()
          } catch (err1) {
            console.log(err1)
            client.close()
            res.end()
          }
        })
      } catch (err0) {
        console.log(err0)
        client.close()
        res.end()
      }
    })
  })

  // app.post('/api/retrievePipeMaterialNameOptions', function (req, res) {
  //   MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
  //     try {
  //       const { productSubclass } = req.body
  //       const $addFields = {
  //         matched: productSubclass.value === '方管'
  //           ? { $regexMatch: { input: '$管材名稱流水號', regex: /^\d{2}$/, options: 'i' } }
  //           : { $regexMatch: { input: '$管材名稱流水號', regex: /^\d{3}$/, options: 'i' } }
  //       }
  //       const $match = { matched: true }
  //       const $group = { _id: null, pipeMaterialNameOptions: { $addToSet: { label: '$管材名稱', serialNumber: '$管材名稱流水號' } } }
  //       client.db('ERP').collection('materialsInform').aggregate([{$addFields}, { $match }, { $group }]).toArray((err1, document) => {
  //         try {
  //           const pipeMaterialNameOptionsFiltered = document.length === 0
  //             ? []
  //             : productSubclass.value === '方管'
  //               ? document[0].pipeMaterialNameOptions.filter(option => Boolean(option.label)).reduce((total, option) => {
  //                   option.serialNumber = /\d{2}$/.exec(option.serialNumber)[0]
  //                   return [...total, option]
  //                 }, [])
  //               : document[0].pipeMaterialNameOptions
  //           res.send({ pipeMaterialNameOptionsFiltered })
  //           client.close()
  //         } catch (err1) {
  //           console.log(err1)
  //           client.close()
  //           res.end()
  //         }
  //       })
  //     } catch (err0) {
  //       console.log(err0)
  //       client.close()
  //       res.end()
  //     }
  //   })
  // })

  app.post('/api/filterPipeMaterial', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { typeIn, item, reference } = req.body
        const $addFields = { matched: { $regexMatch: { input: { $toString: `$${item.label}` }, regex: typeIn, options: 'i' } } }
        const $match = Object.fromEntries ([
          ['matched', true], ...Object.values(reference).map(elem => [elem.label, elem.value])
        ])
        const $group = { _id: null, options: { $addToSet: { label: `$${item.label}`, serialNumber: `$${item.label}流水號` } } }
        client.db('ERP').collection('materialsInform').aggregate([{$addFields}, { $match }, { $group }]).toArray((err1, document) => {
          try {
            res.send({ options: document.length > 0 ? document[0].options.slice(0, 5) : [] })
            client.close()
          } catch (err1) {
            res.end()
            console.error(err1)
            client.close()
          }
        })
      } catch (error) {
        console.log(err0)
        client.close()
        res.end()
      }
    })
  })

  app.post('/api/filterModel', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { typeIn, reference } = req.body
        const $addFields = { matched: { $regexMatch: { input: { $toString: '$型號' }, regex: typeIn, options: 'i' } } }
        const $match = Object.fromEntries ([
          ['matched', true], ...Object.values(reference).map(elem => [elem.label, elem.value])
        ])
        const $group = { _id: null, options: { $addToSet: { label: '$型號', serialNumber: '$產品名稱流水號' } } }
        client.db('ERP').collection('materialsInform').aggregate([{$addFields}, { $match }, { $group }]).toArray((err1, document) => {
          try {
            res.send({ options: document.length > 0 ? document[0].options.slice(0, 5) : [] })
            client.close()
          } catch (err1) {
            console.log(err1)
            client.close()
            res.end()
          }
        })
      } catch (err0) {
        console.log(err0)
        client.close()
        res.end()
      }
    })
  })

  app.post('/api/requestProductNameSerialNumberByModel', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { productClass, productSubclass, serialNumberLengthRequired } = req.body
        const $match = { 產品種類: productClass, 產品材質: productSubclass }
        const $group = { _id: null, productNameFiltered: { $addToSet: { label: '$產品名稱', serialNumber: '$產品名稱流水號' } } }
        client.db('ERP').collection('materialsInform').aggregate([{ $match }, { $group }]).toArray((err1, document) => {
          try {
            res.send({
              productNameSerialNumber: document.length > 0
                ? newSerialNumber(document[0].productNameFiltered, serialNumberLengthRequired)
                : '000'
            })
            client.close()  
          } catch (err1) {
            console.log(err1)
            client.close()
            res.end()
          }
        })
      } catch (err0) {
        console.log(err0)
        client.close()
        res.end()
      }
    })
  })

  app.get('/api/calculateRowsNumber', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`), filter = JSON.parse(getParam(href, 'filter'))
        const $addFields = {
          matched: {
            $and: filter.reduce((total, elem) => {
              total.push({ $regexMatch: { input: { $toString: `$${elem.label}` }, regex: transformTypeInForRegex(elem.typeIn), options: 'i' } })
              return total
            }, [])
          }
        }
        const aggregateProps = filter.length > 0
          ? [{ $addFields }, { $match: { matched: true } }, { $count: 'rowsNumber' }]
          : [{ $match: {} }, { $count: 'rowsNumber' }]
        client.db('ERP').collection('materialsInform').aggregate(aggregateProps).toArray((err1, document) => {
          try {
            const { rowsNumber } = document[0]
            res.send({ rowsNumber })
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

  app.get('/api/deleteMaterialsInform', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const href = new URL(`http://${req.headers.host}${req.url}`), _id = getParam(href, '_id')
        await client.db('ERP').collection('materialsInform').deleteOne({ _id: new ObjectID(_id) })
        res.end()
        client.close()
      } catch (err0) {
        client.close()
        res.end()
        console.log(err0)
      }
    })
  })

  function newSerialNumber (document, serialNumberLengthRequired) {
    let newSerialNumber = null
    const serialNumbers = document.map(elem => Number(elem.serialNumber))
    const ascendingSerialNumbers = serialNumbers.sort((x, y) => x - y)
    for (let i = 0; i < ascendingSerialNumbers.length; i++) {
      if (ascendingSerialNumbers[i] !== i) {
        newSerialNumber = String(i)
        break
      } else if (i === ascendingSerialNumbers.length - 1) {
        newSerialNumber = String(i + 1)
      }
    }
    return reformNewSerialNumber(newSerialNumber, serialNumberLengthRequired)
  }
  function reformNewSerialNumber (newSerialNumber, serialNumberLengthRequired) {
    for (let i = newSerialNumber.length; i < serialNumberLengthRequired; i++) {
      newSerialNumber = '0' + newSerialNumber
    }
    return newSerialNumber
  }

  // http.listen(port, function () {
  //   console.log('listening on *:3003')
  // })
}
