// export function bomSheetBackend () {
module.exports = function () {
  const express = require('express')
  const app = express()
  // const http = require('http').Server(app)
  // const port = 3006
  const http = require('http')
  const server = http.createServer(app)
  app.set('port', process.env.PORT || 3006)
  const ExcelJS = require('exceljs')
  const mongodb = require('mongodb')
  const ObjectID = mongodb.ObjectID
  const MongoClient = mongodb.MongoClient
  const nzhhk = require('nzh/hk')

  const today = new Date()
  const formattedString = (number) => number < 10 ? '0' + number : number + ''
  const year = String(today.getFullYear()), month = formattedString(today.getMonth() + 1), date = formattedString(today.getDate())
  const currentDate = year + month + date

  const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  app.use(express.json())
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST')
    // res.header('Access-Control-Allow-Methods', '*')
    res.header('Access-Control-Allow-Headers', '*')
    next()
  })

  server.listen(app.get('port'), function () {
    console.log('listening on *:3002')
  })

  app.post('/api/deleteFrequentlyUsedProductClass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      if (err0) {
        console.log(err0)
        client.close()
        return
      }
      const { label } = req.body
      await client.db('ERP').collection('frequentlyUsedProductClassList').deleteOne({ label })
      client.close()
    })
  })

  app.post('/api/frequentlyUsedProductClassLabel', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.log(err0)
        client.close()
        return
      }
      client.db('ERP').collection('frequentlyUsedProductClassList').aggregate([{ $project: { _id: 0, label: 1 } }]).toArray((err1, document) => {
        if (err1) {
          console.log(err1)
          client.close()
          return
        }
        const { inputValue } = req.body
        let arrResult = inputValue
          ? document.filter(elem => elem.label.includes(inputValue))
          : document
        arrResult = arrResult.slice(0, 6)
        arrResult = arrResult.map(elem => elem.label)
        res.send({ arrResult })
        client.close()
      })
    })
  })

  app.post('/api/productClassData', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.log(err0)
        client.close()
        return
      }
      const { inputValue } = req.body
      client.db('ERP').collection('frequentlyUsedProductClassList').aggregate([{ $match: { label: inputValue } }, { $project: { _id: 0, data: 1 } }]).toArray((err1, document) => {
        if (err1) {
          console.log(err1)
          client.close()
          return
        }
        const arrResult = document[0].data
        res.send({ arrResult })
        client.close()
      })
    })
  })

  app.post('/api/newFrequentlyUsedProductClass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      if (err0) {
        console.log('Error => ', err0)
        client.close()
        return
      }
      const { label, data } = req.body
      client.db('ERP').listCollections().toArray(async (err1, document1) => {
        if (err1) {
          console.log('Error => ', err1)
        } else if (!document1.some(elem => elem.name === 'frequentlyUsedProductClassList')) {
          await insertDocument()
        } else {
          client.db('ERP').collection('frequentlyUsedProductClassList').aggregate([{ $project: { _id: 0, label: 1 } }]).toArray(async (err2, document2) => {
            if (err2) {
              console.log('Error => ', err2)
              client.close()
            } else if (!document2.some(elem => elem.label === label)) {
              await insertDocument()
            } else {
              res.send({ statusCode: 0 })
              client.close()
            }
          })
        }
      })
      const insertDocument = async () => {
        await client.db('ERP').collection('frequentlyUsedProductClassList').insertOne({ label, data })
        res.send({ statusCode: 1 })
        client.close()
      }
    })
  })

  app.post('/api/updateProductClass', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      try {
        const { frequentlyUsedSelect, productClassData } = req.body
        res.end()
        await client.db('ERP').collection('frequentlyUsedProductClassList').updateOne({ label: frequentlyUsedSelect }, { $set: { data: productClassData } })
        client.close()
      } catch (err0) {
        res.end()
        client.close()
        console.error(err0)
      }
    })
  })

  app.post('/api/getSearchKeyOptions', function (req, res) {
    const $match = {}, $addFields = {}, $project = { _id: 0 }, $unwind = '$sheetInform', $limit = 5
    const { inputKey, typeIn = '', inputValue } = req.body
    $match.display = true
    if (inputKey === 'client') {
      if (typeIn) $project.client = 1
      $addFields.display = {
        $regexMatch: { input: { $toString: `$${inputKey}.value` }, regex: typeIn || inputValue, options: 'i' }
      }
    } else {
      if (typeIn) $project.sheetInform = 1
      $addFields.display = {
        $regexMatch: { input: { $toString: `$sheetInform.${inputKey}.value` }, regex: typeIn || inputValue, options: 'i' }
      }
    }

    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.error(err0)
        client.close()
        return
      }
      client.db('ERP').collection('basicInformForBomSheet2').aggregate([{ $unwind }, { $project }, { $addFields }, { $match }, { $limit }]).toArray((err1, document) => {
        if (err1) {
          console.error(err1)
          client.close()
          return
        }
        client.close()
        if (typeIn) {
          const options = []
          if (document.length > 0) {
            const addOptions = (value) => {
              if (!(options.includes(value))) options.push(value)
            }
            for (const elem of document) {
              if (inputKey === 'client') {
                addOptions(elem[inputKey].value)
              } else {
                addOptions(elem.sheetInform[inputKey].value)
              }
            }
          }
          res.send({ options })
        } else if (inputValue) {
          const freeSearchKeysOptions = {}
          const addFreeSearchKeysOptions = (key, value) => {
            if (!(key in freeSearchKeysOptions)) {
              freeSearchKeysOptions[key] = [value]
            } else if (!(freeSearchKeysOptions[key].includes(value))) { // escape from double elem in the array
              freeSearchKeysOptions[key].push(value)
            }
          }
          if (document.length > 0) {
            for (const field of document) {
              delete field.display
              for (const key in field) {
                if (key === 'sheetInform') {
                  for (const sheetInformKey in field.sheetInform) {
                    addFreeSearchKeysOptions(sheetInformKey, field.sheetInform[sheetInformKey].value)
                  }
                } else {
                  addFreeSearchKeysOptions(key, field[key].value)
                }
              }
            }
          }
          res.send({ freeSearchKeysOptions })
        }
      })
    })
  })

  app.post('/api/getSearchingData', function (req, res) {
    const { searchKeys } = req.body
    const $matchBasicInform = {}, $matchProductInform = {}

    for (const elem of searchKeys) {
      const { name, label, value } = elem
      if (value) {
        if (name === 'productClass' || name === 'productName') {
          $matchProductInform[label] = value
        } else if (name === 'projectName' || name === 'serialNumber') {
          $matchBasicInform[`sheetInform.${name}.value`] = value
        } else if (name === 'client') {
          $matchBasicInform['client.value'] = value
        }
      }
    }

    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.error(err0)
        client.close()
        return
      }

      new Promise((resolve, reject) => {
        // client.db('ERP').collection('ProductClassification').aggregate([{ $match: $matchProductInform }, { $project: { _id: 0, 統編: 1 } }]).toArray((err1, document) => {
        client.db('ERP').collection('materialsInform').aggregate([{ $match: $matchProductInform }, { $project: { _id: 0, 統編: 1 } }]).toArray((err1, document) => {
          if (err1) {
            console.error(err1)
            client.close()
            return
          }
          const matchedTaxIdNumber = document.length > 0 ? [...new Set(document.map(elem => elem.統編))] : []
          resolve(matchedTaxIdNumber)
        })
      }).then(matchedTaxIdNumber => {
        const date = searchKeys[3].value, costClass = searchKeys[4].value, costItem = searchKeys[5].value
        const $unwind = '$sheetInform', $project = { _id: 0 }
        const $addFields = {}

        if (matchedTaxIdNumber.length > 0) {
          $addFields.display = { $in: ['$taxIdNumber.value', matchedTaxIdNumber] }
          $matchBasicInform.display = true
          $project.display = 0

          if (costClass || costItem) {
            $addFields.costFilter = {
              $filter: {
                input: '$sheetInform.cost',
                as: 'elem',
                cond: {
                  $or: [
                    { $in: [costItem, '$$elem.costItem'] },
                    { $eq: ['$$elem.costClass', costClass] }
                  ]
                }
              }
            }
            $matchBasicInform.costFilter = { $gt: [{ $size: '$costFilter' }, 0] }
            $project.costFilter = 0
            $project['sheetInform.cost'] = 0
          }
        }
        if (date) {
          const month = date.substring(0, 7) // yyyy/mm
          const $dateSplit = { $split: ['$sheetInform.date.value', '/'] } // [yyyy, mm ,dd]
          $addFields.month = {
            $reduce: {
              input: { $slice: [$dateSplit, 1, 1] }, // mm
              initialValue: { $arrayElemAt: [{ $slice: [$dateSplit, 1] }, 0] }, // yyyy
              in: { $concat: ['$$value', '/', '$$this'] } // yyyy/mm
            }
          }
          $matchBasicInform.month = month
          $project.month = 0
        }

        client.db('ERP').collection('basicInformForBomSheet2').aggregate([{ $unwind }, { $addFields }, { $match: $matchBasicInform }, { $project }]).toArray((err1, document) => {
          if (err1) {
            console.error(err1)
            client.close()
            return
          }
          const data = []
          const dataElem = (field) => {
            const { taxIdNumber, client, sheetInform } = field
            return {
              _id: sheetInform._idTableData,
              serialNumber: sheetInform.serialNumber.value,
              sheetName: sheetInform.sheetName.value,
              taxIdNumber: taxIdNumber.value,
              client: client.value,
              projectName: sheetInform.projectName.value,
              projectCode: sheetInform.projectCode.value,
              date: sheetInform.date.value
            }
          }

          document.forEach(field => {
            data.push(dataElem(field))
          })
          res.send({ data })
          client.close()
        })
      })
    })
  })

  app.post('/api/exportExcel', async function (req, res) {
    const workbook = new ExcelJS.Workbook()
    const { sheetName, tableData, basicInform, validityPeriod, deliveryTime, shouldInsertBomData } = req.body
    const columns = []
    const costData = tableData.slice(8, tableData.length - 1)
    const rows = tableData.slice()
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
    const _id = new ObjectID(), serialNumber = rows[4].column4, date = rows[5].column4

    if (shouldInsertBomData) {
      const projectCode = basicInform[0].value, bomData = { _id, projectCode, data: [] }
      for (const data of tableData) {
        bomData.data.push({ ...data })
      }
      const cost = [], costPackage = { costClass: '', costItem: [] }
      costData.forEach((elem, index, arr) => {
        if (Object.keys(elem).length === 2) {
          if (costPackage.costClass) {
            cost.push({ ...costPackage })
            costPackage.costClass = ''
            costPackage.costItem = []
          }
          costPackage.costClass = elem.column1
        } else {
          costPackage.costItem.push(elem.column1)
        }
        if (index === arr.length - 1) cost.push({ ...costPackage })
      })

      MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
        if (err0) {
          console.error(err0)
          client.close()
          return
        }
        new Promise((resolve, reject) => {
          client.db('ERP').collection('bomData').aggregate([{ $project: { _id: 0, 'data.column4': 1 } }, { $unwind: '$data' }, { $match: { 'data.column4': serialNumber } }]).toArray(async (err1, document) => {
            if (err1) {
              console.error(err1)
              client.close()
              return
            }
            // if the same serial number doesn't exit in the database, insert the data.
            if (document.length === 0) {
              await client.db('ERP').collection('bomData').insertOne(bomData)
            }
            resolve(document.length === 0)
          })
        }).then(newSheet => {
          if (!newSheet) {
            client.close()
          } else {
            const clientInform = basicInform.filter(elem => elem.name !== 'projectCode' && elem.name !== 'projectName')
            const $match = clientInform.reduce((total, elem, index) => {
              return Object.assign(total, Object.fromEntries([[`${elem.name}.value`, elem.value]]))
            }, {})
            const projectCode = basicInform[0].value, projectName = basicInform[1].value
            const projectInform = (_id, date, serialNumber, sheetName, projectCode, projectName) => {
              return {
                _idTableData: _id,
                date: { label: '日期', value: date },
                serialNumber: { label: '編號', value: serialNumber },
                sheetName: { label: '表單名稱', value: sheetName === 'bomSheet' ? '物料清單' : '報價單' },
                projectCode: { label: 'Project code', value: projectCode },
                projectName: { label: '工程名稱', value: projectName },
                cost
              }
            }

            client.db('ERP').collection('basicInformForBomSheet2').aggregate([{ $match }, { $project: { _id: 1, sheetInform: 1 } }]).toArray(async (err1, document) => {
              if (err1) {
                console.error(err1)
                client.close()
                return
              }
              if (document.length === 0) {
                const basicInformDocument = clientInform.reduce((total, elem) => {
                  const { name, label, value } = elem
                  return Object.assign(total, Object.fromEntries([[name, { label, value }]]))
                }, {})
                Object.assign(basicInformDocument, { sheetInform: [projectInform(_id, date, serialNumber, sheetName, projectCode, projectName)] })
                await client.db('ERP').collection('basicInformForBomSheet2').insertOne(basicInformDocument)
              } else if (document[0].sheetInform.findIndex(elem => elem.serialNumber === serialNumber) === -1) {
                const field = document[0]
                const sheetInform = [...field.sheetInform, projectInform(_id, date, serialNumber, sheetName, projectCode, projectName)]
                await client.db('ERP').collection('basicInformForBomSheet2').updateOne({ _id: field._id }, { $set: { sheetInform } })
              }
              client.close()
            })
          }
        })
      })
    }

    for (const i of Array(9).keys()) {
      columns.splice(columns.length, 0, {
        header: `column${i}`,
        key: `column${i}`
      })
    }
    costData.forEach((elem, index) => {
      for (let i = 0; i < 9; i++) {
        if (!(`column${i}` in elem)) rows[index + 7 + 1][`column${i}`] = ''
      }
    })
    const formWorksheet = (worksheet) => {
      // insert columns
      worksheet.columns = columns

      // insert data
      worksheet.addRows(rows)

      // remove header
      worksheet.spliceRows(1, 1)

      const firmPhone = worksheet.getCell('A3').value
      const firmFax = worksheet.getCell('B3').value
      const clientName = {
        key: worksheet.getCell('B5').value,
        value: worksheet.getCell('C5').value
      }
      const serialNumber = {
        key: worksheet.getCell('D5').value,
        value: worksheet.getCell('E5').value
      }
      const projectName = {
        key: worksheet.getCell('B6').value,
        value: worksheet.getCell('C6').value
      }
      const date = {
        key: worksheet.getCell('D6').value,
        value: worksheet.getCell('E6').value
      }
      const contactPerson = {
        key: worksheet.getCell('B7').value,
        value: worksheet.getCell('C7').value
      }
      const clientPhone = {
        key: worksheet.getCell('D7').value,
        value: worksheet.getCell('E7').value
      }
      const clientFax = {
        key: worksheet.getCell('F7').value,
        value: worksheet.getCell('G7').value
      }
      worksheet.getCell('A3').value = `${firmPhone}                            ${firmFax}`
      worksheet.getCell('A4').font = { underline: true }
      worksheet.getCell('B5').value = clientName.key + clientName.value
      worksheet.getCell('F5').value = serialNumber.key + serialNumber.value
      worksheet.getCell('B6').value = projectName.key + projectName.value
      worksheet.getCell('F6').value = date.key + date.value
      worksheet.getCell('B7').value = contactPerson.key + contactPerson.value
      worksheet.getCell('C7').value = clientPhone.key + clientPhone.value
      worksheet.getCell('F7').value = clientFax.key + clientFax.value
      worksheet.mergeCells('A1:I1')
      worksheet.mergeCells('A2:I2')
      worksheet.mergeCells('A3:I3')
      worksheet.mergeCells('A4:I4')
      worksheet.mergeCells('B5:E5')
      worksheet.mergeCells('F5:I5')
      worksheet.mergeCells('B6:E6')
      worksheet.mergeCells('F6:I6')
      worksheet.mergeCells('C7:E7')
      worksheet.mergeCells('F7:I7')

      // calculate total rate
      const column6 = worksheet.getColumn('column6')
      const summaryCost = column6.values.slice(8 + 1).reduce((total, elem) => { // include empty item
        return Number(total) + Number(elem)
      })
      const lastRow = worksheet.getRow(rows.length)
      lastRow.getCell('column8').value = numberWithCommas(summaryCost)

      const formatNumberWithCommas = (columns) => {
        for (const elem of columns) {
          const column = worksheet.getColumn(elem)
          column.eachCell((cell, rowNumber) => {
            if (rowNumber > 8 && cell.value) {
              cell.value = numberWithCommas(cell.value)
            }
          })
        }
      }
      formatNumberWithCommas(['column3', 'column5', 'column6'])

      return { summaryCost }
    }

    const autoWidth = (worksheet) => {
      for (const elem of ['column1', 'column2', 'column7']) {
        const column = worksheet.getColumn(elem)
        const minimalWidth = 10
        let maxColumnLength = 0
        column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
          if (rowNumber > 7) {
            cell.alignment = Object.assign(cell.alignment || {}, { wrapText: true })
            maxColumnLength = Math.max(
              maxColumnLength,
              cell.value ? cell.value.toString().length : minimalWidth
            )
          }
        })
        column.width = maxColumnLength * 2
      }
    }

    const styleCells = (worksheet) => {
      // set cells alignment and border
      for (const elem of alphabet) {
        for (let i = 1; i < rows.length; i++) {
          const cell = worksheet.getCell(`${elem}${i}`)
          if (i > 4 && i < 8) { // row 5, row 6 and row 7
            cell.alignment = { vertical: 'middle', horizontal: 'left' }
            if (elem === 'A') cell.border = Object.assign(cell.border || {}, { left: { style: 'thin' } })
            else if (elem === 'F') cell.border = Object.assign(cell.border || {}, { right: { style: 'thin' } })
            cell.border = Object.assign(cell.border || {}, { top: { style: 'thin' }, bottom: { style: 'thin' } })
          } else if (i < 5 || i > 7) { // not include row 5 and row 6
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
            if (i < 5 || i === 8) { // row 1 to row 4 and row 8
              cell.alignment = { vertical: 'middle', horizontal: 'center' }
            } else if (i > 8) { // from row 9 to the row before the last row
              if (!('id' in rows[i - 1])) {
                cell.alignment = { vertical: 'middle', horizontal: elem === 'A' ? 'center' : 'left' }
              } else {
                if (elem === 'B' || elem === 'D' || elem === 'E') {
                  cell.alignment = { vertical: 'middle', horizontal: 'center' }
                } else if (elem === 'C' || elem === 'H') {
                  cell.alignment = { vertical: 'middle', horizontal: 'left' }
                } else if (elem === 'F' || elem === 'G') {
                  cell.alignment = { vertical: 'middle', horizontal: 'right' }
                }
              }
            }
          }
        }
      }

      alphabet.splice(1, 7) // ['A', 'I']
      worksheet.mergeCells(`A${rows.length}:H${rows.length}`) // row of total
      alphabet.forEach(elem => {
        worksheet.getCell(`${elem}${rows.length}`).alignment = { vertical: 'middle', horizontal: elem === 'A' ? 'left' : 'right' }
        worksheet.getCell(`${elem}${rows.length}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    }

    const createBomSheet = () => {
      workbook.addWorksheet('BOM表')
      const bomSheet = workbook.getWorksheet('BOM表')
      formWorksheet(bomSheet)
      styleCells(bomSheet)
      autoWidth(bomSheet)
    }

    const createQuotation = () => {
      workbook.addWorksheet('報價單')
      const quotation = workbook.getWorksheet('報價單')
      const quotationWorksheet = formWorksheet(quotation)
      const { summaryCost } = quotationWorksheet

      // format quotation
      let index = 0
      for (const costItem of costData) {
        const costItemIndex = rows.indexOf(costItem)
        if (costItem.column0) {
          rows.splice(costItemIndex, 1)
          quotation.spliceRows(costItemIndex + 1, 1)
        } else {
          const cell = quotation.getCell(`A${costItemIndex + 1}`)
          index++
          cell.value = index
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
        }
      }

      styleCells(quotation)
      autoWidth(quotation)

      // calculate business tax
      const businessTax = Math.round(summaryCost * 0.05)
      quotation.getCell(`A${rows.length + 1}`).value = '營業稅5%'
      quotation.getCell(`I${rows.length + 1}`).value = numberWithCommas(businessTax)

      // calculate total cost
      quotation.getCell(`A${rows.length + 2}`).value = `總  計：${nzhhk.encodeB(summaryCost + businessTax)}元整`
      quotation.getCell(`I${rows.length + 2}`).value = numberWithCommas(summaryCost + businessTax)

      // Period of validity, delivery time and representative
      quotation.getCell(`A${rows.length + 3}`).value = `1. 本報價單有效期限：${validityPeriod}天。`
      quotation.getCell(`A${rows.length + 4}`).value = `2. 交貨期限：圖面確認後${deliveryTime}天。`
      quotation.getCell(`H${rows.length + 5}`).value = '經辦人：潘啟川'

      for (let i = rows.length + 1; i <= rows.length + 2; i++) { // 'add "bussiness tax" and "total cost"'
        quotation.mergeCells(`A${i}:H${i}`)
        alphabet.forEach(elem => {
          quotation.getCell(`${elem}${i}`).alignment = { vertical: 'middle', horizontal: elem === 'A' ? 'left' : 'right' }
          quotation.getCell(`${elem}${i}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
      }
    }

    if (sheetName === 'bomSheet') createBomSheet()
    else if (sheetName === 'quotation') createQuotation()

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
    res.end()
  })

  app.post('/api/obtainBomData', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.error(err0)
        client.close()
        return
      }
      const { _id } = req.body
      client.db('ERP').collection('bomData').aggregate([{ $match: { _id: new ObjectID(_id) } }, { $project: { _id: 0 } }]).toArray((err1, document) => {
        if (err1) {
          console.error(err1)
          client.close()
          return
        }
        client.close()
        res.send({ bomData: document[0].data })
      })
    })
  })

  app.post('/api/deleteBomData', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
      if (err0) {
        console.error(err0)
        client.close()
        return
      }
      const { selectedSheet } = req.body
      const _idSelectedSheet = [], taxIdNumberSelectedSheet = []
      selectedSheet.forEach(elem => {
        const { _id, taxIdNumber } = elem
        if (!_idSelectedSheet.includes(new ObjectID(_id))) _idSelectedSheet.push(new ObjectID(_id))
        if (!taxIdNumberSelectedSheet.includes(taxIdNumber)) taxIdNumberSelectedSheet.push(taxIdNumber)
      })
      await client.db('ERP').collection('bomData').deleteMany({ _id: { $in: _idSelectedSheet } })
      await client.db('ERP').collection('basicInformForBomSheet2').updateMany(
        { 'taxIdNumber.value': { $in: taxIdNumberSelectedSheet } },
        { $pull: { sheetInform: { _idTableData: { $in: _idSelectedSheet } } } }
      )
      res.end()
      client.close()
    })
  })

  app.post('/api/getSerialNumber', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.error(err0)
        client.close()
        return
      }
      const timeStampFromCurrentDate = Date.parse(`${year}-${month}-${date}T00:00:00`)
      const objectIdFromDate = Math.floor(timeStampFromCurrentDate / 1000).toString(16) + '0000000000000000'
      client.db('ERP').collection('bomData').aggregate([{ $project: { _id: 1 } }, { $match: { _id: { $gt: new ObjectID(objectIdFromDate) } } }]).toArray((err1, document) => {
        if (err1) {
          console.error(err1)
          client.close()
          return
        }
        client.close()
        res.send({ serialNumber: currentDate + formattedString(document.length + 1) })
      })
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

  app.post('/api/filterOtherCosts', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const { reference, inputItem, typeIn, label } = req.body
        const $addFields = { matched: { $regexMatch: { input: { $toString: `$${label}` }, regex: typeIn, options: 'i' } } }
        const $match = Object.assign({ matched: true }, reference)
        const $group = Object.fromEntries([['_id', null], [inputItem.name, { $addToSet: `$${label}` }]])
        client.db('ERP').collection('invoiceRecord').aggregate([{ $addFields }, { $match }, { $group }]).toArray((err1, document) => {
          try {
            res.send({ options: document.length > 0 ? document[0][inputItem.name].slice(0, 5) : [] })
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

  app.post('/api/getProductNameOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        return
      }
      const { productClass, inputValue, label } = req.body
      const $addFields = { matched: { $regexMatch: { input: { $toString: `$${label}` }, regex: inputValue, options: 'i' } } }
      const $match = { 產品種類: productClass, matched: true }, $project = { _id: 0, 產品名稱: 1 }
      client.db('ERP').collection('materialsInform').aggregate([{ $addFields }, { $match }, { $project }]).toArray((err1, document) => {
        if (err1) {
          console.error(err1)
          client.close()
          return
        }
        res.send({ arrResult: document.length > 0 ? document.map(field => field.產品名稱).slice(0, 5) : [] })
        client.close()
      })
    })
  })

  app.post('/api/getModelOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
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
          const arrResult = [...new Set(document.map(elem => elem.型號))].slice(0, 5)
          res.send({ arrResult })
        }
        res.end()
        client.close()
      })
    })
  })

  app.post('/api/getPricesOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      if (err0) {
        console.log(err0)
        return
      }
      const { productName, model } = req.body
      client.db('ERP').collection('invoiceRecord').aggregate([{ $match: { 進銷項: '銷項', 產品名稱: productName, 型號: model } }, { $project: { _id: 0, 單價: 1 } }]).toArray((err1, document) => {
        try {
          res.send({ arrResult: [...new Set(document.map(elem => elem.單價))].slice(0, 5) })
          client.close()
        } catch (err1) {
          res.end()
          console.error(err1)
          client.close()
        }
      })
    })
  })

  app.post('/api/getProductClassOptions', function (req, res) {
    const { productClassTypeIn } = req.body
    MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, function (err0, client) {
      try {
        const $addFields = { productClassMatched: { $regexMatch: { input: { $toString: '$產品種類' }, regex: productClassTypeIn, options: 'i' } } }
        const $match = { productClassMatched: true }, $project = { _id: 0, 產品種類: 1 }
        client.db('ERP').collection('ProductClassification').aggregate([{ $addFields }, { $match }, { $project }]).toArray((err1, document) => {
          try {
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

  // http.listen(port, function () {
  //   console.log('listening on *:3006')
  // })
}
